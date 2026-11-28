import { CorsHttpMethod, HttpApi, HttpMethod, HttpStage, type HttpRouteIntegration } from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpJwtAuthorizer } from 'aws-cdk-lib/aws-apigatewayv2-authorizers';
import { Duration } from 'aws-cdk-lib';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import type { Config } from './config.js';
import { params } from './contracts.js';

export interface ServiceApiProps {
  config: Config;
  /** Service name, used in the API name. */
  service: string;
  /** Steady-state requests per second for the whole API (rate limiting, #32). */
  rateLimit?: number;
  burstLimit?: number;
}

/**
 * One HTTP API per service (not REST API: about 70 % cheaper, ADR 0004).
 * Every route is behind a JWT authorizer that trusts the identity service's
 * user pool, found through SSM, unless added with `publicRoute`.
 *
 * Each service owning its API means it deploys, throttles and versions on its
 * own. When a domain exists, one custom domain maps `/<service>` to each API.
 */
export class ServiceApi extends Construct {
  readonly api: HttpApi;
  readonly url: string;
  private readonly authorizer: HttpJwtAuthorizer;

  constructor(scope: Construct, id: string, props: ServiceApiProps) {
    super(scope, id);
    const { config } = props;
    const issuer = StringParameter.valueForStringParameter(this, params.identityIssuer(config.stage));
    const audience = StringParameter.valueForStringParameter(this, params.identityWebClientId(config.stage));

    this.authorizer = new HttpJwtAuthorizer('Jwt', issuer, { jwtAudience: [audience] });
    this.api = new HttpApi(this, 'Api', {
      apiName: `${config.prefix}-${props.service}`,
      createDefaultStage: false,
      corsPreflight: {
        allowOrigins: config.webOrigins,
        allowMethods: [CorsHttpMethod.GET, CorsHttpMethod.PUT, CorsHttpMethod.POST, CorsHttpMethod.DELETE],
        allowHeaders: ['authorization', 'content-type', 'if-match'],
        exposeHeaders: ['etag'],
        maxAge: Duration.hours(1),
      },
    });
    const stage = new HttpStage(this, 'Stage', {
      httpApi: this.api,
      stageName: '$default',
      autoDeploy: true,
      throttle: { rateLimit: props.rateLimit ?? 20, burstLimit: props.burstLimit ?? 40 },
    });
    this.url = stage.url;
  }

  route(path: string, methods: HttpMethod[], integration: HttpRouteIntegration): void {
    this.api.addRoutes({ path, methods, integration, authorizer: this.authorizer });
  }

  publicRoute(path: string, methods: HttpMethod[], integration: HttpRouteIntegration): void {
    this.api.addRoutes({ path, methods, integration });
  }
}
