import type { APIGatewayProxyEventV2WithJWTAuthorizer } from 'aws-lambda';
import { describe, expect, it } from 'vitest';
import { handler } from '../lib/services/saves/handlers/api.js';
import { byType, synth } from './helpers.js';

const saves = () => synth({ stage: 'dev' }).find((s) => s.stack.endsWith('-saves'))!;

describe('saves stack', () => {
  it('owns a pk/sk table with a ttl attribute', () => {
    const [[, t]] = byType(saves(), 'AWS::DynamoDB::GlobalTable');
    expect(t.Properties!.TableName).toBe('gerdquest-dev-saves');
    expect(t.Properties!.KeySchema).toEqual([
      { AttributeName: 'pk', KeyType: 'HASH' },
      { AttributeName: 'sk', KeyType: 'RANGE' },
    ]);
    expect(t.Properties!.TimeToLiveSpecification).toEqual({ AttributeName: 'ttl', Enabled: true });
  });

  it('puts every route but health behind the JWT authorizer', () => {
    const routes = byType(saves(), 'AWS::ApiGatewayV2::Route').map(([, r]) => r.Properties!);
    expect(routes.length).toBeGreaterThan(5);
    for (const r of routes) {
      if (r.RouteKey === 'GET /v1/health') expect(r.AuthorizationType ?? 'NONE').toBe('NONE');
      else expect(r.AuthorizationType, r.RouteKey).toBe('JWT');
    }
  });

  it('reads the issuer and audience from the identity service through SSM', () => {
    const [[, a]] = byType(saves(), 'AWS::ApiGatewayV2::Authorizer');
    const params = JSON.stringify(saves().template.toJSON().Parameters);
    expect(params).toContain('/gerdquest/dev/identity/issuer');
    expect(params).toContain('/gerdquest/dev/identity/web-client-id');
    expect(a.Properties!.AuthorizerType).toBe('JWT');
  });
});

describe('saves handler (stub)', () => {
  const event = (routeKey: string, sub?: string) =>
    ({ routeKey, requestContext: { authorizer: sub ? { jwt: { claims: { sub }, scopes: [] } } : undefined } }) as unknown as APIGatewayProxyEventV2WithJWTAuthorizer;

  it('answers health without a token', async () => {
    expect(await handler(event('GET /v1/health'))).toMatchObject({ statusCode: 200 });
  });

  it('refuses a request without a verified sub', async () => {
    expect(await handler(event('GET /v1/slots'))).toMatchObject({ statusCode: 401 });
  });

  it('is not implemented yet for signed-in calls', async () => {
    expect(await handler(event('GET /v1/slots', 'user-a'))).toMatchObject({ statusCode: 501 });
  });
});
