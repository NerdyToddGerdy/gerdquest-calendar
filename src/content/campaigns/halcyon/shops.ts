// Shop and dock stock by stage of the year (prices rise as the Shoal gets more dangerous).
type Stock = { id: string; price: number }[]

export const SHOP_EARLY: Stock = [
  { id: 'ration', price: 1 },
  { id: 'hd_medgel', price: 5 },
  { id: 'hd_arcgrenade', price: 4 },
  { id: 'hd_targetspike', price: 5 },
  { id: 'hd_chaff', price: 5 },
  { id: 'hd_suture', price: 12 },
  { id: 'hd_vest', price: 12 },
  { id: 'hd_visor', price: 10 },
]

export const SHOP_MID: Stock = [
  { id: 'ration', price: 1 },
  { id: 'hd_medgel', price: 5 },
  { id: 'hd_traumakit', price: 9 },
  { id: 'hd_plasmacharge', price: 7 },
  { id: 'hd_aegispatch', price: 4 },
  { id: 'hd_targetspike', price: 5 },
  { id: 'hd_chaff', price: 5 },
  { id: 'hd_suture', price: 12 },
  { id: 'hd_witstim', price: 3 },
  { id: 'hd_plate', price: 20 },
  { id: 'hd_jetboots', price: 18 },
]

export const SHOP_LATE: Stock = [
  { id: 'ration', price: 2 },
  { id: 'hd_traumakit', price: 9 },
  { id: 'hd_plasmacharge', price: 7 },
  { id: 'hd_aegispatch', price: 4 },
  { id: 'hd_targetspike', price: 6 },
  { id: 'hd_chaff', price: 6 },
  { id: 'hd_suture', price: 12 },
  { id: 'hd_luckcoin', price: 8 },
  { id: 'hd_helm2', price: 22 },
  { id: 'hd_gauntlets', price: 24 },
  { id: 'hd_songstone', price: 26 },
]

export const STIMS: Stock = [
  { id: 'ration', price: 1 },
  { id: 'hd_medgel', price: 5 },
  { id: 'hd_focusstim', price: 3 },
  { id: 'hd_gripstim', price: 3 },
  { id: 'hd_reflexstim', price: 3 },
  { id: 'hd_witstim', price: 3 },
  { id: 'hd_charmstim', price: 3 },
]

type Dock = { crew?: string[]; upgrades?: { id: string; price: number }[]; partsPrice?: number }

export const DOCK_EARLY: Dock = {
  crew: ['hd_rook', 'hd_petra', 'hd_oduya'],
  upgrades: [
    { id: 'hd_up_plating', price: 8 },
    { id: 'hd_up_tracking', price: 12 },
    { id: 'hd_up_vanes', price: 12 },
    { id: 'hd_up_bunks', price: 10 },
    { id: 'hd_up_autodoc', price: 8 },
  ],
  partsPrice: 3,
}

export const DOCK_MID: Dock = {
  crew: ['hd_tobiah', 'hd_nadia', 'hd_rook', 'hd_oduya'],
  upgrades: [
    { id: 'hd_up_railbank', price: 24 },
    { id: 'hd_up_ghostdrive', price: 24 },
    { id: 'hd_up_capacitor', price: 14 },
    { id: 'hd_up_bunks', price: 10 },
    { id: 'hd_up_medbay', price: 18 },
  ],
  partsPrice: 3,
}

export const DOCK_LATE: Dock = {
  crew: ['hd_bix', 'hd_sable', 'hd_tobiah', 'hd_nadia'],
  upgrades: [
    { id: 'hd_up_aegis', price: 28 },
    { id: 'hd_up_railbank', price: 24 },
    { id: 'hd_up_ghostdrive', price: 24 },
    { id: 'hd_up_armorhold', price: 18 },
    { id: 'hd_up_medbay', price: 18 },
  ],
  partsPrice: 4,
}
