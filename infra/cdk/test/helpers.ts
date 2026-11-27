import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { buildStacks } from '../lib/app.js';

export type Resources = Record<string, { Type: string; Properties?: Record<string, any>; DeletionPolicy?: string }>;

export interface Synth {
  stack: string;
  template: Template;
  json: { Resources: Resources; Outputs?: Record<string, any> };
}

const cache = new Map<string, Synth[]>();

/** Synthesize every stack for a stage (cached; bundling takes a few seconds). */
export function synth(context: Record<string, string> = {}): Synth[] {
  const key = JSON.stringify(context);
  const hit = cache.get(key);
  if (hit) return hit;
  const app = new App({ context });
  const out = buildStacks(app).map((s) => {
    const template = Template.fromStack(s);
    return { stack: s.stackName, template, json: template.toJSON() as Synth['json'] };
  });
  cache.set(key, out);
  return out;
}

export const byType = (s: Synth, type: string) =>
  Object.entries(s.json.Resources).filter(([, r]) => r.Type === type);

export const allStages = () => [synth({ stage: 'dev' }), synth({ stage: 'prod' })];
