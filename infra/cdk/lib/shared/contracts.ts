// The only things services share: where to find each other's public values
// (SSM parameter names) and the shape of the events they publish.
//
// Services never import another service's code, never read another service's
// table, and never use CloudFormation exports (Fn::ImportValue). Values are
// handed over through SSM parameters, resolved at deploy time, so any stack
// can be redeployed or replaced on its own. See docs/adr/0005-service-boundaries.md.

import type { Stage } from './config.js';

export const params = {
  /** Platform: name of the shared EventBridge bus. */
  eventBusName: (s: Stage) => `/gerdquest/${s}/platform/event-bus-name`,
  /** Identity: JWT issuer URL of the user pool. */
  identityIssuer: (s: Stage) => `/gerdquest/${s}/identity/issuer`,
  /** Identity: id of the public (PKCE) web client; the JWT audience. */
  identityWebClientId: (s: Stage) => `/gerdquest/${s}/identity/web-client-id`,
  /** Identity: managed-login base URL for the web client. */
  identityLoginUrl: (s: Stage) => `/gerdquest/${s}/identity/login-url`,
  /** Saves: base URL of the saves API. */
  savesApiUrl: (s: Stage) => `/gerdquest/${s}/saves/api-url`,
} as const;

/** EventBridge `source` per publishing service. */
export const sources = {
  identity: 'gerdquest.identity',
  saves: 'gerdquest.saves',
  commerce: 'gerdquest.commerce',
} as const;

/**
 * Events published on the shared bus. `detail-type` → `detail`. Consumers
 * subscribe with their own rules; a publisher never knows who listens.
 * Planned, not yet emitted: no service publishes these until its Lambdas exist.
 */
export interface Events {
  /** Identity → saves, commerce, discord: delete everything keyed by this user. */
  UserDeleted: { sub: string; deletedAt: string };
  /** Commerce → release: a campaign was bought, gifted or granted. */
  EntitlementGranted: { sub: string; campaignId: string; source: 'stripe' | 'gift' | 'promo' | 'free' };
  /** Discord → saves (lookup only): a Discord account was linked to a user. */
  DiscordLinked: { sub: string; discordId: string };
}
