import { fileURLToPath } from 'node:url';
import { Stack, type StackProps } from 'aws-cdk-lib';
import { HttpMethod } from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { AttributeType, Billing, TableV2 } from 'aws-cdk-lib/aws-dynamodb';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import type { Construct } from 'constructs';
import type { Config } from '../../shared/config.js';
import { params } from '../../shared/contracts.js';
import { dataRemovalPolicy } from '../../shared/naming.js';
import { ServiceApi } from '../../shared/service-api.js';
import { ServiceFunction } from '../../shared/service-function.js';

export interface SavesStackProps extends StackProps {
  config: Config;
}

/**
 * Saves service (#2): cloud copies of everything the device keeps today:
 * slots, finished-page records, chronicle log, calendar notes, settings and
 * desk progress. Owns its table outright; no other service reads it.
 *
 * Key design: ADR 0004 "DynamoDB design" and "Cloud save shape", minus the
 * commerce and Discord items, which live in those services' own tables.
 */
export class SavesStack extends Stack {
  constructor(scope: Construct, id: string, props: SavesStackProps) {
    super(scope, id, props);
    const { config } = props;
    const prod = config.stage === 'prod';

    const table = new TableV2(this, 'Table', {
      tableName: `${config.prefix}-saves`,
      partitionKey: { name: 'pk', type: AttributeType.STRING },
      sortKey: { name: 'sk', type: AttributeType.STRING },
      billing: Billing.onDemand(),
      timeToLiveAttribute: 'ttl',
      // PITR is a few cents a month; dev skips it to stay at $0.
      pointInTimeRecoverySpecification: { pointInTimeRecoveryEnabled: prod },
      deletionProtection: prod,
      removalPolicy: dataRemovalPolicy(config),
    });

    // One function per service ("Lambdalith") until a route needs different
    // memory, timeout or permissions: fewer cold starts, one log group.
    const fn = new ServiceFunction(this, 'Api', {
      entry: fileURLToPath(new URL('./handlers/api.ts', import.meta.url)),
      description: 'Saves API (stub until #2 step 3)',
      environment: { TABLE_NAME: table.tableName },
    });
    table.grantReadWriteData(fn);

    const api = new ServiceApi(this, 'Http', { config, service: 'saves' });
    const integration = new HttpLambdaIntegration('Lambda', fn);
    api.publicRoute('/v1/health', [HttpMethod.GET], integration);
    api.route('/v1/slots', [HttpMethod.GET], integration);
    api.route('/v1/slots/{slotId}', [HttpMethod.GET, HttpMethod.PUT, HttpMethod.DELETE], integration);
    api.route('/v1/slots/{slotId}/pages', [HttpMethod.POST], integration);
    api.route('/v1/calendar', [HttpMethod.GET, HttpMethod.PUT], integration);
    api.route('/v1/settings', [HttpMethod.GET, HttpMethod.PUT], integration);
    api.route('/v1/progress', [HttpMethod.GET, HttpMethod.PUT], integration);

    new StringParameter(this, 'ApiUrlParam', { parameterName: params.savesApiUrl(config.stage), stringValue: api.url });
  }
}
