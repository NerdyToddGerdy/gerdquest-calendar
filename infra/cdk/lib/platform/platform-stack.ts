import { Stack, type StackProps } from 'aws-cdk-lib';
import { CfnBudget } from 'aws-cdk-lib/aws-budgets';
import { EventBus } from 'aws-cdk-lib/aws-events';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import type { Construct } from 'constructs';
import type { Config } from '../shared/config.js';
import { params } from '../shared/contracts.js';

export interface PlatformStackProps extends StackProps {
  config: Config;
}

/**
 * Account-level pieces no single service owns: the cost alarm and the event
 * bus services talk through. Deliberately small; anything with business
 * logic belongs to a service.
 */
export class PlatformStack extends Stack {
  constructor(scope: Construct, id: string, props: PlatformStackProps) {
    super(scope, id, props);
    const { config } = props;

    // One monthly cost budget, alerting on actual spend at $1, $5 and $10.
    const limit = config.budgetUsd;
    new CfnBudget(this, 'MonthlyBudget', {
      budget: {
        budgetName: `${config.prefix}-monthly`,
        budgetType: 'COST',
        timeUnit: 'MONTHLY',
        budgetLimit: { amount: limit, unit: 'USD' },
      },
      notificationsWithSubscribers: [1, 5, 10].map((usd) => ({
        notification: {
          notificationType: 'ACTUAL',
          comparisonOperator: 'GREATER_THAN',
          threshold: (usd / limit) * 100,
          thresholdType: 'PERCENTAGE',
        },
        subscribers: [{ subscriptionType: 'EMAIL', address: config.budgetEmail }],
      })),
    });

    // Custom bus: idle costs nothing; events are $1 per million.
    const bus = new EventBus(this, 'Bus', { eventBusName: config.prefix });
    new StringParameter(this, 'BusNameParam', {
      parameterName: params.eventBusName(config.stage),
      stringValue: bus.eventBusName,
    });
  }
}
