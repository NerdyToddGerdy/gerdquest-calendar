import { describe, expect, it } from 'vitest';
import { byType, synth } from './helpers.js';

const identity = (ctx: Record<string, string>) => synth(ctx).find((s) => s.stack.endsWith('-identity'))!;

describe('identity service', () => {
  it('has a public PKCE web client: no secret, code flow only, site callback', () => {
    const [[, c]] = byType(identity({ stage: 'prod' }), 'AWS::Cognito::UserPoolClient');
    const p = c.Properties!;
    expect(p.GenerateSecret).toBe(false);
    expect(p.AllowedOAuthFlows).toEqual(['code']);
    expect(p.CallbackURLs).toEqual(['https://nerdytoddgerdy.github.io/gerdquest-calendar/play/']);
    expect(p.SupportedIdentityProviders).toEqual(['COGNITO']);
    expect(p.PreventUserExistenceErrors).toBe('ENABLED');
  });

  it('allows localhost only in dev', () => {
    const [[, c]] = byType(identity({ stage: 'dev' }), 'AWS::Cognito::UserPoolClient');
    expect(c.Properties!.CallbackURLs).toContain('http://localhost:5173/play/');
  });

  it('uses a length-only password policy', () => {
    const [[, pool]] = byType(identity({ stage: 'dev' }), 'AWS::Cognito::UserPool');
    expect(pool.Properties!.Policies.PasswordPolicy).toMatchObject({
      MinimumLength: 8,
      RequireLowercase: false,
      RequireUppercase: false,
      RequireNumbers: false,
      RequireSymbols: false,
    });
  });

  it('adds Google only when a client id is given, with the secret kept out of the template', () => {
    const s = identity({ stage: 'dev', googleClientId: 'example.apps.googleusercontent.com' });
    const [[, idp]] = byType(s, 'AWS::Cognito::UserPoolIdentityProvider');
    expect(idp.Properties!.ProviderName).toBe('Google');
    expect(JSON.stringify(idp.Properties!.ProviderDetails.client_secret)).toContain('Ref');
    const [[, c]] = byType(s, 'AWS::Cognito::UserPoolClient');
    expect(c.Properties!.SupportedIdentityProviders).toEqual(['COGNITO', 'Google']);
  });
});
