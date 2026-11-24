// Tests play every bundled campaign, so load them all up front. (The web app
// loads each pack on demand; see src/campaigns.ts.)
import { BUNDLED_CATALOG } from '@questender/engine/content/bundled'
import { loadCampaigns } from '@questender/engine/campaign'

await loadCampaigns(BUNDLED_CATALOG.map((e) => e.id))
