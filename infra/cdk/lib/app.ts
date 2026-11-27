import type { App, Environment, Stack } from 'aws-cdk-lib';
import { loadConfig } from './shared/config.js';
import { PlatformStack } from './platform/platform-stack.js';
import { IdentityStack } from './services/identity/identity-stack.js';
import { SavesStack } from './services/saves/saves-stack.js';

/**
 * One stack per service plus a small platform stack, all for one stage.
 * Stacks share nothing through CloudFormation exports; dependencies below
 * only order the first deploy (SSM parameters must exist before they're read).
 */
export function buildStacks(app: App, env?: Environment): Stack[] {
  const config = loadConfig((k) => app.node.tryGetContext(k));
  const name = (svc: string) => `${config.prefix}-${svc}`;

  const platform = new PlatformStack(app, name('platform'), { env, config, description: 'GerdQuest: budget alarm and event bus' });
  const identity = new IdentityStack(app, name('identity'), { env, config, description: 'GerdQuest identity service: Cognito user pool and managed login' });
  const saves = new SavesStack(app, name('saves'), { env, config, description: 'GerdQuest saves service: cloud saves API and table' });

  identity.addStackDependency(platform);
  saves.addStackDependency(identity);
  return [platform, identity, saves];
}
