import type { APIGatewayProxyEventV2WithJWTAuthorizer, APIGatewayProxyResultV2 } from 'aws-lambda';

// Stub until #2 step 3 (repository module, zod schemas in packages/api-types,
// gzip bodies, `rev` optimistic concurrency). It already shows the one rule
// every handler here must keep: the user comes only from the verified JWT
// `sub`, never from the path, query or body.

const json = (statusCode: number, body: unknown): APIGatewayProxyResultV2 => ({
  statusCode,
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(body),
});

export async function handler(event: APIGatewayProxyEventV2WithJWTAuthorizer): Promise<APIGatewayProxyResultV2> {
  if (event.routeKey === 'GET /v1/health') return json(200, { ok: true, service: 'saves' });
  const sub = event.requestContext.authorizer?.jwt?.claims?.sub;
  if (typeof sub !== 'string' || sub.length === 0) return json(401, { error: 'unauthorized' });
  return json(501, { error: 'not_implemented', route: event.routeKey });
}
