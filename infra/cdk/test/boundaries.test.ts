import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { allStages, byType } from './helpers.js';

// Service boundaries (ADR 0005). Each service is a folder under lib/services
// and its own stack; these tests keep them independently deployable.

const ROOT = fileURLToPath(new URL('../lib/', import.meta.url));
const SERVICES = join(ROOT, 'services');

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? files(p) : p.endsWith('.ts') ? [p] : [];
  });
}

describe('service code', () => {
  const services = readdirSync(SERVICES).filter((n) => statSync(join(SERVICES, n)).isDirectory());

  it.each(services)('%s imports no other service and not the platform stack', (svc) => {
    for (const file of files(join(SERVICES, svc))) {
      const src = readFileSync(file, 'utf8');
      for (const m of src.matchAll(/from\s+'(\.[^']+)'/g)) {
        const target = relative(ROOT, join(file, '..', m[1]));
        const top = target.split(sep);
        const ok = top[0] === 'shared' || (top[0] === 'services' && top[1] === svc);
        expect(ok, `${relative(ROOT, file)} imports ${m[1]}`).toBe(true);
      }
    }
  });

  it('shared code imports no service', () => {
    for (const file of files(join(ROOT, 'shared'))) {
      expect(readFileSync(file, 'utf8'), relative(ROOT, file)).not.toMatch(/from\s+'[^']*services\//);
    }
  });
});

describe.each([0, 1])('synthesized stacks (%#)', (i) => {
  const stacks = allStages()[i];

  it('share nothing through CloudFormation exports', () => {
    for (const s of stacks) {
      const text = JSON.stringify(s.json);
      expect(text, s.stack).not.toContain('Fn::ImportValue');
      for (const [k, o] of Object.entries(s.json.Outputs ?? {})) expect(o.Export, `${s.stack}.${k}`).toBeUndefined();
    }
  });

  it('give each table exactly one owning stack, and only its functions access it', () => {
    for (const s of stacks) {
      const tables = byType(s, 'AWS::DynamoDB::GlobalTable').map(([id]) => id);
      const policies = byType(s, 'AWS::IAM::Policy');
      for (const [pid, p] of policies) {
        const doc = JSON.stringify(p.Properties!.PolicyDocument);
        if (!doc.includes('dynamodb:')) continue;
        // Any DynamoDB grant must point at a table defined in the same stack.
        expect(tables.some((t) => doc.includes(t)), `${s.stack}/${pid}`).toBe(true);
      }
    }
  });

  it('publishes its public values to SSM under /gerdquest/<stage>/<owner>/', () => {
    for (const s of stacks) {
      const owner = s.stack.split('-').slice(2).join('-');
      for (const [id, r] of byType(s, 'AWS::SSM::Parameter')) {
        expect(r.Properties!.Name, `${s.stack}/${id}`).toMatch(new RegExp(`^/gerdquest/(dev|prod)/${owner}/`));
      }
    }
  });
});
