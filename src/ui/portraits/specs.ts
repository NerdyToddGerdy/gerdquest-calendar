// How every hero and boss looks. Keyed by hero / enemy id.
import type { CreatureSpec, FigureSpec, PortraitSpec } from './spec'

const SKIN = { fair: '#f0c9a6', rose: '#e8b896', tan: '#d3a07a', olive: '#b9875e', brown: '#8f5c3c', deep: '#5e3a24' }
const HAIR = { black: '#1f1a17', brown: '#5a3a22', auburn: '#8a3f1e', blond: '#d8b46a', grey: '#a9a49c', white: '#e6e2da', red: '#b5502a' }

const fig = (s: Omit<FigureSpec, 'kind'>): FigureSpec => ({ kind: 'figure', ...s })
const beast = (s: Omit<CreatureSpec, 'kind'>): CreatureSpec => ({ kind: 'creature', ...s })

export const PORTRAITS: Record<string, PortraitSpec> = {
  // ---------- The Lamp at Brightwatch: heroes ----------
  wren: fig({ build: 'armored', skin: SKIN.rose, hair: HAIR.auburn, hairStyle: 'braid', outfit: '#3d5a73', trim: '#c9a45a', prop: 'halberd', cloak: '#26384a' }),
  isolde: fig({ build: 'robed', skin: SKIN.tan, hair: HAIR.black, hairStyle: 'long', outfit: '#2f6f7a', trim: '#8fe3d0', prop: 'coralstaff', glow: '#8fe3d0' }),
  corin: fig({ build: 'slim', skin: SKIN.olive, hair: HAIR.brown, hairStyle: 'wild', outfit: '#6a3d5a', trim: '#d9a15b', prop: 'daggers', head: 'bandana', headColor: '#a33a3a' }),
  'bw-ottilie': fig({ build: 'robed', skin: SKIN.fair, hair: HAIR.blond, hairStyle: 'bun', outfit: '#e2d6b8', trim: '#b8862e', prop: 'lanternmace', glow: '#ffd88a', head: 'veil', headColor: '#cfc3a4' }),
  'bw-hask': fig({ build: 'slim', skin: SKIN.brown, hair: HAIR.black, hairStyle: 'cropped', beard: true, outfit: '#4f6a3a', trim: '#8a6a3a', prop: 'bow', cloak: '#36472a' }),
  'bw-jory': fig({ build: 'broad', skin: SKIN.rose, hair: HAIR.red, hairStyle: 'short', beard: true, outfit: '#5a4a3a', trim: '#2a2a30', prop: 'hook', head: 'cap', headColor: '#3a4a5a' }),

  // ---------- Brightwatch: bosses ----------
  'bw-paleHerald': beast({ shape: 'fog', body: '#c8d2dc', accent: '#b8862e', eye: '#e8f4ff', crown: true }),
  'bw-bellWarden': beast({ shape: 'construct', body: '#8a6a3a', accent: '#5fa58a', eye: '#ffd88a' }),
  'bw-ropeGnawer': beast({ shape: 'crab', body: '#7a6a5a', accent: '#a8957a', eye: '#e8d07a' }),
  'bw-sedgeMother': beast({ shape: 'plant', body: '#4f6a3a', accent: '#b8862e', eye: '#cfe88a' }),
  'bw-tarnSerpent': beast({ shape: 'serpent', body: '#3f5f6a', accent: '#9fc4d6', eye: '#e8f4ff' }),
  'bw-hushknight': fig({ build: 'armored', skin: SKIN.fair, hair: HAIR.grey, hairStyle: 'bald', outfit: '#6a6e74', trim: '#9aa0a8', prop: 'sword', head: 'helm', headColor: '#7a7f86', shield: true }),
  'bw-abyssalShepherd': beast({ shape: 'ghost', body: '#1d3a4a', accent: '#4fa3c7', eye: '#8fe3d0' }),
  'bw-abbessVane': fig({ build: 'robed', skin: SKIN.fair, hair: HAIR.white, hairStyle: 'bald', outfit: '#d6d2ca', trim: '#8a8f96', prop: 'book', head: 'veil', headColor: '#b9b6ae' }),
  'bw-fogwyrm': beast({ shape: 'serpent', body: '#9aa8b4', accent: '#e6eef5', eye: '#bfe6ff', wings: true }),
  'bw-bellBreaker': fig({ build: 'broad', skin: SKIN.olive, hair: HAIR.black, hairStyle: 'bald', beard: true, outfit: '#5a5e64', trim: '#3a3a40', prop: 'maul', scale: 1.08 }),
  'bw-drownedHost': beast({ shape: 'host', body: '#4a6a72', accent: '#9fc4d6', eye: '#bfe6ff' }),
  'bw-heirGuard': fig({ build: 'armored', skin: SKIN.fair, hair: HAIR.grey, hairStyle: 'bald', outfit: '#8a8f96', trim: '#c8ccd2', prop: 'halberd', head: 'helm', headColor: '#a9aeb6' }),
  'bw-vaneUnbound': beast({ shape: 'ghost', body: '#c8ccd2', accent: '#8a8f96', eye: '#e8f4ff', crown: false }),
  'bw-paleHeir': beast({ shape: 'fog', body: '#dfe6ec', accent: '#c9a45a', eye: '#ffffff', crown: true }),
  'bw-paleTide': beast({ shape: 'fog', body: '#aebbc6', accent: '#e6eef5', eye: '#d8f0ff' }),

  // ---------- The Ember Road: heroes ----------
  er_tamsin: fig({ build: 'slim', skin: SKIN.fair, hair: HAIR.auburn, hairStyle: 'braid', outfit: '#6a4a2c', trim: '#d9a15b', prop: 'lanternpole', glow: '#ffd88a', cloak: '#4a3a2a', head: 'hood', headColor: '#7a5a3a' }),
  er_garrick: fig({ build: 'broad', skin: SKIN.tan, hair: HAIR.brown, hairStyle: 'cropped', beard: true, outfit: '#7a4a2a', trim: '#8a8f96', prop: 'hammer', shield: true }),
  er_ysolde: fig({ build: 'robed', skin: SKIN.fair, hair: HAIR.white, hairStyle: 'long', outfit: '#3f6a8a', trim: '#bfe6ff', prop: 'staff', glow: '#bfe6ff' }),
  er_pell: fig({ build: 'slim', skin: SKIN.rose, hair: HAIR.black, hairStyle: 'wild', outfit: '#4a3a5a', trim: '#a78bd0', prop: 'dagger', cloak: '#2a2236' }),
  er_odalys: fig({ build: 'robed', skin: SKIN.brown, hair: HAIR.black, hairStyle: 'bun', outfit: '#e8d6a8', trim: '#c98a3e', prop: 'censer', glow: '#ffd88a', head: 'veil', headColor: '#d8c698' }),
  er_kesh: fig({ build: 'slim', skin: SKIN.olive, hair: HAIR.black, hairStyle: 'bald', outfit: '#5a8a6a', trim: '#d9a15b', prop: 'staff', head: 'headband', headColor: '#c94a3a' }),
  er_wenna: fig({ build: 'slim', skin: SKIN.tan, hair: HAIR.grey, hairStyle: 'braid', outfit: '#5a6a3a', trim: '#8a6a3a', prop: 'bow', cloak: '#e6e2da', head: 'hood', headColor: '#d8d2c6' }),

  // ---------- Ember Road: bosses ----------
  er_warden: fig({ build: 'armored', skin: '#c8d6e0', hair: HAIR.grey, hairStyle: 'bald', outfit: '#4a5466', trim: '#8fb4e8', prop: 'halberd', head: 'helm', headColor: '#5a6478', ghost: '#8fb4e8' }),
  er_kennelmaster: fig({ build: 'robed', skin: SKIN.fair, hair: HAIR.white, hairStyle: 'bald', outfit: '#e6eef5', trim: '#8fb4e8', prop: 'whip', glow: '#bfe6ff', head: 'skull', scale: 1.1 }),
  er_glasswater: beast({ shape: 'ghost', body: '#9fc4d6', accent: '#e6f4ff', eye: '#ffffff' }),
  er_mossshepherd: beast({ shape: 'plant', body: '#5a7a4a', accent: '#8fb4e8', eye: '#bfe6ff' }),
  er_colossus: beast({ shape: 'construct', body: '#7fa8c4', accent: '#e0f0ff', eye: '#3b6da8' }),
  er_varrow: fig({ build: 'armored', skin: SKIN.rose, hair: HAIR.blond, hairStyle: 'short', outfit: '#6a6e74', trim: '#e8e2d0', prop: 'sword', head: 'helm', headColor: '#c8ccd2', shield: true, cloak: '#3a3a40' }),
  er_cinderwyrm: beast({ shape: 'serpent', body: '#4a2a22', accent: '#e07a3a', eye: '#ffb05a', wings: true }),
  er_vigilant: beast({ shape: 'construct', body: '#e6e2da', accent: '#8a8f96', eye: '#8fb4e8' }),
  er_tender: fig({ build: 'armored', skin: SKIN.fair, hair: HAIR.white, hairStyle: 'bald', outfit: '#e6e2da', trim: '#8fb4e8', prop: 'halberd', head: 'helm', headColor: '#d8d2c6', cloak: '#c8ccd2' }),
  er_unlitsaint: beast({ shape: 'ghost', body: '#3a3a46', accent: '#8a8f96', eye: '#8fb4e8', crown: true }),
  er_abbess: fig({ build: 'robed', skin: SKIN.fair, hair: HAIR.white, hairStyle: 'bald', outfit: '#f0ece4', trim: '#8fb4e8', prop: 'staff', glow: '#8fb4e8', head: 'veil', headColor: '#dcd8d0' }),
  er_longdark: beast({ shape: 'fog', body: '#1d2b45', accent: '#8fb4e8', eye: '#bfe6ff', crown: true }),

  // ---------- The Halcyon Debt: heroes ----------
  hd_tamsin: fig({ build: 'slim', skin: SKIN.olive, hair: HAIR.black, hairStyle: 'short', outfit: '#3a5a7a', trim: '#e8b25a', prop: 'pistol', glow: '#7fd4ff', head: 'goggles', headColor: '#5a4a3a' }),
  hd_brask: fig({ build: 'broad', skin: SKIN.deep, hair: HAIR.black, hairStyle: 'bald', beard: true, outfit: '#5a5a3a', trim: '#e8b25a', prop: 'maul' }),
  hd_ilse: fig({ build: 'slim', skin: SKIN.fair, hair: HAIR.blond, hairStyle: 'bun', outfit: '#e6eef5', trim: '#e06a5a', prop: 'pistol', glow: '#6cc48f' }),
  hd_kit: fig({ build: 'slim', skin: SKIN.rose, hair: '#4fa3c7', hairStyle: 'wild', outfit: '#2a2a3a', trim: '#7fd4ff', prop: 'pistol', glow: '#7fd4ff', head: 'goggles', headColor: '#2a2a3a' }),
  hd_ash: fig({ build: 'armored', skin: SKIN.tan, hair: HAIR.black, hairStyle: 'cropped', outfit: '#4a5a4a', trim: '#8a8f96', prop: 'rifle', glow: '#ff8a5a' }),
  hd_seren: fig({ build: 'slim', skin: SKIN.brown, hair: HAIR.auburn, hairStyle: 'long', outfit: '#7a3a4a', trim: '#e8b25a', prop: 'pistol', glow: '#ff8a5a', cloak: '#3a2a30' }),
  hd_juniper: fig({ build: 'slim', skin: SKIN.deep, hair: HAIR.black, hairStyle: 'braid', outfit: '#e07a3a', trim: '#2a2a30', prop: 'baton', glow: '#7fd4ff' }),

  // ---------- Halcyon: bosses ----------
  hd_kessel: fig({ build: 'broad', skin: SKIN.rose, hair: HAIR.grey, hairStyle: 'cropped', outfit: '#2a2a30', trim: '#c9a45a', prop: 'baton', glow: '#e8b25a' }),
  hd_strand: fig({ build: 'slim', skin: SKIN.fair, hair: HAIR.white, hairStyle: 'bun', outfit: '#d8dce2', trim: '#7fd4ff', prop: 'pistol', glow: '#7fd4ff' }),
  hd_sela: fig({ build: 'slim', skin: SKIN.tan, hair: HAIR.red, hairStyle: 'wild', outfit: '#3a2a3a', trim: '#7fd4ff', prop: 'whip', glow: '#7fd4ff', cloak: '#5a3a4a' }),
  hd_sentinel: beast({ shape: 'construct', body: '#3a3256', accent: '#a08cff', eye: '#cfc6ff' }),
  hd_bloom: beast({ shape: 'plant', body: '#6a3a5a', accent: '#e07aa0', eye: '#ffd0e0' }),
  hd_vell: fig({ build: 'slim', skin: SKIN.fair, hair: HAIR.black, hairStyle: 'short', outfit: '#2a2a3a', trim: '#e8b25a', prop: 'sword', head: 'tricorn', headColor: '#1a1a24', cloak: '#5a1a2a' }),
  hd_fane: fig({ build: 'slim', skin: SKIN.brown, hair: HAIR.grey, hairStyle: 'cropped', outfit: '#4a3a2a', trim: '#8a8f96', prop: 'rifle', glow: '#ff8a5a', head: 'hat', headColor: '#2a2018', cloak: '#3a2a1e' }),
  hd_choirwarden: beast({ shape: 'construct', body: '#4a4070', accent: '#e8d6ff', eye: '#a08cff', crown: true }),
  hd_quell: fig({ build: 'broad', skin: SKIN.olive, hair: HAIR.grey, hairStyle: 'short', beard: true, outfit: '#3a4a5a', trim: '#c9a45a', prop: 'pistol', head: 'cap', headColor: '#2a3a4a' }),
  hd_executor: fig({ build: 'armored', skin: SKIN.fair, hair: HAIR.black, hairStyle: 'bald', outfit: '#1a1a24', trim: '#c9a45a', prop: 'baton', glow: '#e8b25a', head: 'mask', headColor: '#c9a45a' }),
  hd_thale: fig({ build: 'robed', skin: SKIN.rose, hair: HAIR.white, hairStyle: 'bun', outfit: '#1a1a24', trim: '#c9a45a', prop: 'book', cloak: '#3a1a24' }),

  // ---------- The Starwake: heroes ----------
  sw_greta: fig({ build: 'robed', skin: SKIN.rose, hair: HAIR.white, hairStyle: 'bun', outfit: '#3a4a6a', trim: '#c9a86a', prop: 'cane', head: 'tricorn', headColor: '#2a2a30' }),
  sw_bram: fig({ build: 'broad', skin: SKIN.tan, hair: HAIR.brown, hairStyle: 'cropped', beard: true, outfit: '#7a5a3a', trim: '#3a2a1e', prop: 'fists', head: 'cap', headColor: '#3a4a5a' }),
  sw_isadora: fig({ build: 'robed', skin: SKIN.brown, hair: HAIR.black, hairStyle: 'long', outfit: '#2f6f7a', trim: '#6fc3c9', prop: 'wand', glow: '#8fe3d0' }),
  sw_kip: fig({ build: 'slim', skin: SKIN.fair, hair: HAIR.red, hairStyle: 'wild', outfit: '#5a4a6a', trim: '#a98bd0', prop: 'dagger', head: 'bandana', headColor: '#3a6a8a' }),
  sw_sel: fig({ build: 'robed', skin: SKIN.olive, hair: HAIR.grey, hairStyle: 'bun', outfit: '#e8dcc4', trim: '#b8862e', prop: 'bell', head: 'hood', headColor: '#3a4a6a' }),
  sw_tanu: fig({ build: 'slim', skin: SKIN.deep, hair: HAIR.black, hairStyle: 'long', outfit: '#3a7a6a', trim: '#e8dcc4', prop: 'dagger', head: 'headband', headColor: '#e8dcc4' }),
  sw_reyna: fig({ build: 'slim', skin: SKIN.tan, hair: HAIR.blond, hairStyle: 'braid', outfit: '#4a5a3a', trim: '#8a6a3a', prop: 'harpoon', cloak: '#2a3a4a' }),

  // ---------- Starwake: bosses ----------
  sw_tidewarden: beast({ shape: 'construct', body: '#8a6a3a', accent: '#5fa58a', eye: '#ffd88a' }),
  sw_dredge: beast({ shape: 'machine', body: '#5a4a3a', accent: '#c9a45a', eye: '#ff8a5a' }),
  sw_rocmother: beast({ shape: 'bird', body: '#4a4a5a', accent: '#e9f1ff', eye: '#ffd88a' }),
  sw_reflection: fig({ build: 'slim', skin: '#bfd8e0', hair: '#5a7a8a', hairStyle: 'short', outfit: '#3a5a6a', trim: '#9fc4d6', prop: 'sword', ghost: '#bfe6ff' }),
  sw_veyra: fig({ build: 'armored', skin: '#c8d8d8', hair: HAIR.white, hairStyle: 'bun', outfit: '#5a2a2a', trim: '#c9a45a', prop: 'sword', head: 'tricorn', headColor: '#2a2a30', ghost: '#bfe6ff' }),
  sw_deepmaw: beast({ shape: 'serpent', body: '#0e2632', accent: '#3a7a8a', eye: '#d8f0ff' }),
  sw_teague: fig({ build: 'broad', skin: SKIN.rose, hair: HAIR.black, hairStyle: 'bald', beard: true, outfit: '#4a4a52', trim: '#c9a45a', prop: 'axe', scale: 1.08 }),
  sw_orrery: beast({ shape: 'machine', body: '#4a3d6a', accent: '#e8b25a', eye: '#ffd88a' }),
  sw_giltgull: beast({ shape: 'ship', body: '#3a3a42', accent: '#e8c87a', eye: '#ffd88a' }),
  sw_cloudback: beast({ shape: 'serpent', body: '#8a96c8', accent: '#e8f0ff', eye: '#ffd88a', wings: true }),
  sw_cageengine: beast({ shape: 'machine', body: '#4a3a2a', accent: '#cfe0ff', eye: '#ffd88a' }),
  sw_ashe: fig({ build: 'slim', skin: SKIN.fair, hair: HAIR.black, hairStyle: 'long', outfit: '#c9a45a', trim: '#3a3a42', prop: 'sword', head: 'tricorn', headColor: '#2a2a30', cloak: '#3a3a42', glow: '#e8f4ff' }),
  sw_hollowneedle: beast({ shape: 'fog', body: '#1d2448', accent: '#e8f0ff', eye: '#ffffff', crown: true }),
}
