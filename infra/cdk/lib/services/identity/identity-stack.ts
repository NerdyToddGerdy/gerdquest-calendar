import { Duration, SecretValue, Stack, type StackProps } from 'aws-cdk-lib';
import {
  AccountRecovery,
  FeaturePlan,
  ManagedLoginVersion,
  OAuthScope,
  ProviderAttribute,
  UserPool,
  UserPoolClientIdentityProvider,
  UserPoolIdentityProviderGoogle,
} from 'aws-cdk-lib/aws-cognito';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import type { Construct } from 'constructs';
import type { Config } from '../../shared/config.js';
import { params } from '../../shared/contracts.js';
import { dataRemovalPolicy } from '../../shared/naming.js';

export interface IdentityStackProps extends StackProps {
  config: Config;
}

/**
 * Identity service: who the player is. Owns the Cognito user pool, the
 * managed sign-in pages and the web client. Other services only see a JWT
 * (verified by API Gateway) and its `sub`; none of them call Cognito.
 *
 * Later (not built yet): account deletion and "Link Google" Lambdas, and the
 * `UserDeleted` event that tells every other service to drop that user's data.
 */
export class IdentityStack extends Stack {
  constructor(scope: Construct, id: string, props: IdentityStackProps) {
    super(scope, id, props);
    const { config } = props;
    const prod = config.stage === 'prod';

    const pool = new UserPool(this, 'Users', {
      userPoolName: `${config.prefix}-users`,
      featurePlan: FeaturePlan.LITE, // free tier; no Plus threat protection
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
      keepOriginal: { email: true },
      standardAttributes: { email: { required: true, mutable: true } },
      // NIST 800-63B style: length, not composition rules (ADR 0004).
      passwordPolicy: {
        minLength: 8,
        requireLowercase: false,
        requireUppercase: false,
        requireDigits: false,
        requireSymbols: false,
        tempPasswordValidity: Duration.days(3),
      },
      accountRecovery: AccountRecovery.EMAIL_ONLY, // never SMS: billed per message
      // Cognito's built-in email sender: free, ~50/day. Move to SES only if hit.
      deletionProtection: prod,
      removalPolicy: dataRemovalPolicy(config),
    });

    const providers = [UserPoolClientIdentityProvider.COGNITO];
    let google: UserPoolIdentityProviderGoogle | undefined;
    if (config.googleClientId) {
      // The secret is read from an SSM parameter at deploy time, so it never
      // appears in the template. Standard parameters are free (Secrets
      // Manager would be $0.40/month). Create it by hand once; see README.
      const secret = StringParameter.valueForStringParameter(this, `/gerdquest/${config.stage}/identity/google-client-secret`);
      google = new UserPoolIdentityProviderGoogle(this, 'Google', {
        userPool: pool,
        clientId: config.googleClientId,
        clientSecretValue: SecretValue.unsafePlainText(secret),
        scopes: ['openid', 'email', 'profile'],
        attributeMapping: { email: ProviderAttribute.GOOGLE_EMAIL },
      });
      providers.push(UserPoolClientIdentityProvider.GOOGLE);
    }

    // Public browser client: authorization code + PKCE, no client secret.
    const web = pool.addClient('Web', {
      userPoolClientName: `${config.prefix}-web`,
      generateSecret: false,
      authFlows: {},
      oAuth: {
        flows: { authorizationCodeGrant: true },
        scopes: [OAuthScope.OPENID, OAuthScope.EMAIL, OAuthScope.PROFILE],
        callbackUrls: config.callbackUrls,
        logoutUrls: config.logoutUrls,
      },
      supportedIdentityProviders: providers,
      preventUserExistenceErrors: true,
      accessTokenValidity: Duration.hours(1),
      idTokenValidity: Duration.hours(1),
      refreshTokenValidity: Duration.days(30),
    });
    if (google) web.node.addDependency(google);

    const domain = pool.addDomain('Login', {
      cognitoDomain: { domainPrefix: config.authDomainPrefix },
      // Classic hosted UI: available on the free Lite plan. The newer managed
      // login (brandable) needs Essentials; switch both together, and only if
      // Essentials stays inside the free MAU allowance (ADR 0004).
      managedLoginVersion: ManagedLoginVersion.CLASSIC_HOSTED_UI,
    });

    const publish = (id: string, parameterName: string, stringValue: string) =>
      new StringParameter(this, id, { parameterName, stringValue });
    publish('IssuerParam', params.identityIssuer(config.stage), pool.userPoolProviderUrl);
    publish('WebClientParam', params.identityWebClientId(config.stage), web.userPoolClientId);
    publish('LoginUrlParam', params.identityLoginUrl(config.stage), domain.baseUrl());
  }
}
