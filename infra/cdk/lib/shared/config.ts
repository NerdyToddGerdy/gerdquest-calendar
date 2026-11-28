// Deployment settings shared by every stack. Nothing here reads an AWS account:
// `cdk synth` works offline, and stacks are environment-agnostic unless
// CDK_DEFAULT_ACCOUNT / CDK_DEFAULT_REGION are set at deploy time.

export type Stage = 'dev' | 'prod';

export interface Config {
  stage: Stage;
  /** Resource name prefix, e.g. `gerdquest-dev`. */
  prefix: string;
  /** Browser origins allowed to call the APIs (CORS) and to receive sign-in redirects. */
  webOrigins: string[];
  /** Where Cognito sends players back after sign-in / sign-out. */
  callbackUrls: string[];
  logoutUrls: string[];
  /** Globally unique Cognito managed-login domain prefix. */
  authDomainPrefix: string;
  /** Monthly budget ceiling in USD; alerts at 10 %, 50 % and 100 % ($1 / $5 / $10). */
  budgetUsd: number;
  /** Who gets budget alerts. Defaults to the public contact address (issue #22). */
  budgetEmail: string;
  /** Google sign-in is optional. Off until a client id is supplied (see README). */
  googleClientId?: string;
}

const SITE_ORIGIN = 'https://nerdytoddgerdy.github.io';
const SITE_PLAY = `${SITE_ORIGIN}/gerdquest-calendar/play/`;
const DEV_ORIGIN = 'http://localhost:5173';

export function loadConfig(context: (key: string) => unknown): Config {
  const stage = (context('stage') ?? 'dev') as string;
  if (stage !== 'dev' && stage !== 'prod') throw new Error(`stage must be dev or prod, got "${stage}"`);
  const prefix = `gerdquest-${stage}`;
  const local = stage === 'dev' ? [DEV_ORIGIN] : [];
  const str = (key: string) => {
    const v = context(key);
    return typeof v === 'string' && v.length > 0 ? v : undefined;
  };
  return {
    stage,
    prefix,
    webOrigins: [SITE_ORIGIN, ...local],
    callbackUrls: [SITE_PLAY, ...local.map((o) => `${o}/play/`)],
    logoutUrls: [SITE_PLAY, ...local.map((o) => `${o}/play/`)],
    authDomainPrefix: str('authDomainPrefix') ?? prefix,
    budgetUsd: 10,
    budgetEmail: str('budgetEmail') ?? 'toadimous+calendarquest@gmail.com',
    googleClientId: str('googleClientId'),
  };
}
