import { describe, expect, it } from 'vitest';
import { allStages, byType, synth } from './helpers.js';

// The cost guardrails from ADR 0004, checked on every synthesized template so a
// change that would add a fixed monthly cost fails CI instead of the bill.

const BANNED = [
  /^AWS::EC2::/, // VPCs, NAT gateways, instances
  /^AWS::RDS::/,
  /^AWS::ECS::/,
  /^AWS::EKS::/,
  /^AWS::ElastiCache::/,
  /^AWS::OpenSearchService::/,
  /^AWS::ElasticLoadBalancingV2::/,
  /^AWS::SecretsManager::Secret$/, // $0.40/month each; use SSM parameters
  /^AWS::ApiGateway::RestApi$/, // HTTP APIs only
  /^AWS::WAFv2::/,
  /^AWS::CloudFront::/, // no CloudFront for the API
  /^AWS::KMS::Key$/, // $1/month each; AWS-owned keys are free
];

describe.each(['dev', 'prod'])('%s stage', (stage) => {
  const stacks = synth({ stage });

  it('has no resources with a fixed monthly cost', () => {
    for (const s of stacks) {
      for (const [id, r] of Object.entries(s.json.Resources)) {
        expect(BANNED.filter((re) => re.test(r.Type)), `${s.stack}/${id}: ${r.Type}`).toEqual([]);
      }
    }
  });

  it('runs every Lambda on arm64, Node 24, outside any VPC, briefly', () => {
    for (const s of stacks) {
      for (const [id, r] of byType(s, 'AWS::Lambda::Function')) {
        const p = r.Properties!;
        expect(p.Architectures, id).toEqual(['arm64']);
        expect(p.Runtime, id).toBe('nodejs24.x');
        expect(p.VpcConfig, id).toBeUndefined();
        expect(p.Timeout, id).toBeLessThanOrEqual(10);
        expect(p.MemorySize, id).toBeLessThanOrEqual(512);
        expect(p.LoggingConfig?.LogGroup, `${id} has its own log group`).toBeDefined();
      }
    }
  });

  it('keeps every log group for 7 days', () => {
    for (const s of stacks) {
      for (const [id, r] of byType(s, 'AWS::Logs::LogGroup')) expect(r.Properties!.RetentionInDays, id).toBe(7);
    }
  });

  it('bills DynamoDB on demand only', () => {
    for (const s of stacks) {
      for (const [id, r] of byType(s, 'AWS::DynamoDB::GlobalTable')) expect(r.Properties!.BillingMode, id).toBe('PAY_PER_REQUEST');
      expect(byType(s, 'AWS::DynamoDB::Table')).toEqual([]);
    }
  });

  it('throttles every API stage', () => {
    for (const s of stacks) {
      for (const [id, r] of byType(s, 'AWS::ApiGatewayV2::Stage')) {
        const t = r.Properties!.DefaultRouteSettings;
        expect(t?.ThrottlingRateLimit, id).toBeGreaterThan(0);
        expect(t?.ThrottlingBurstLimit, id).toBeGreaterThan(0);
      }
    }
  });

  it('uses the free Cognito plan with no SMS', () => {
    const pools = stacks.flatMap((s) => byType(s, 'AWS::Cognito::UserPool'));
    expect(pools).toHaveLength(1);
    const p = pools[0][1].Properties!;
    expect(p.UserPoolTier).toBe('LITE');
    expect(p.SmsConfiguration).toBeUndefined();
    expect(p.MfaConfiguration ?? 'OFF').toBe('OFF');
    expect(p.AccountRecoverySetting.RecoveryMechanisms).toEqual([{ Name: 'verified_email', Priority: 1 }]);
  });

  it('alerts on actual spend at $1, $5 and $10', () => {
    const budgets = stacks.flatMap((s) => byType(s, 'AWS::Budgets::Budget'));
    expect(budgets).toHaveLength(1);
    const p = budgets[0][1].Properties!;
    expect(p.Budget.BudgetLimit).toEqual({ Amount: 10, Unit: 'USD' });
    const thresholds = p.NotificationsWithSubscribers.map((n: any) => n.Notification.Threshold);
    expect(thresholds).toEqual([10, 50, 100]);
    for (const n of p.NotificationsWithSubscribers) {
      expect(n.Notification.NotificationType).toBe('ACTUAL');
      expect(n.Subscribers).toEqual([{ SubscriptionType: 'EMAIL', Address: 'toadimous+calendarquest@gmail.com' }]);
    }
  });
});

describe('data retention by stage', () => {
  const [dev, prod] = allStages();
  const tables = (stacks: typeof dev) => stacks.flatMap((s) => byType(s, 'AWS::DynamoDB::GlobalTable'));
  const pools = (stacks: typeof dev) => stacks.flatMap((s) => byType(s, 'AWS::Cognito::UserPool'));

  it('prod keeps tables and users when a stack is deleted, with PITR on', () => {
    for (const [id, r] of tables(prod)) {
      expect(r.DeletionPolicy, id).toBe('Retain');
      expect(r.Properties!.Replicas[0].DeletionProtectionEnabled, id).toBe(true);
      expect(r.Properties!.Replicas[0].PointInTimeRecoverySpecification.PointInTimeRecoveryEnabled, id).toBe(true);
    }
    for (const [id, r] of pools(prod)) {
      expect(r.DeletionPolicy, id).toBe('Retain');
      expect(r.Properties!.DeletionProtection, id).toBe('ACTIVE');
    }
  });

  it('dev tears down to nothing and skips PITR', () => {
    for (const [id, r] of tables(dev)) {
      expect(r.DeletionPolicy, id).toBe('Delete');
      expect(r.Properties!.Replicas[0].PointInTimeRecoverySpecification.PointInTimeRecoveryEnabled, id).toBe(false);
    }
    for (const [id, r] of pools(dev)) expect(r.DeletionPolicy, id).toBe('Delete');
  });
});
