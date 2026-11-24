// Port stock for The Starwake, tiered as the voyage (and prices) climb.

type Stock = { id: string; price: number }[]

/** Saltmere Quay and the near isles. */
export const SHOP_PORT: Stock = [
  { id: 'ration', price: 1 },
  { id: 'sw_kelptea', price: 5 },
  { id: 'sw_powder', price: 4 },
  { id: 'sw_rum', price: 3 },
  { id: 'sw_bandage', price: 6 },
  { id: 'sw_honeybun', price: 3 },
  { id: 'sw_stardrops', price: 2 },
]

/** The open isles: the first upgrades and gear. */
export const SHOP_ISLES: Stock = [
  { id: 'ration', price: 1 },
  { id: 'sw_kelptea', price: 6 },
  { id: 'sw_powder', price: 5 },
  { id: 'sw_rum', price: 4 },
  { id: 'sw_bandage', price: 6 },
  { id: 'sw_saltpork', price: 4 },
  { id: 'sw_hone', price: 7 },
  { id: 'sw_tarredgrip', price: 8 },
  { id: 'sw_tricorn', price: 9 },
]

/** Far waters: stronger medicine and powder. */
export const SHOP_FAR: Stock = [
  { id: 'ration', price: 2 },
  { id: 'sw_kelptea', price: 6 },
  { id: 'sw_pearltonic', price: 10 },
  { id: 'sw_keg', price: 9 },
  { id: 'sw_sharkoil', price: 6 },
  { id: 'sw_coralsalve', price: 9 },
  { id: 'sw_limes', price: 4 },
  { id: 'sw_hone', price: 8 },
  { id: 'sw_tarredgrip', price: 9 },
]

/** Storm waters and the run to the Rim: everything costs more. */
export const SHOP_STORM: Stock = [
  { id: 'ration', price: 2 },
  { id: 'sw_pearltonic', price: 12 },
  { id: 'sw_keg', price: 10 },
  { id: 'sw_sharkoil', price: 7 },
  { id: 'sw_coralsalve', price: 10 },
  { id: 'sw_coffee', price: 5 },
  { id: 'sw_staretch', price: 14 },
  { id: 'sw_tarredgrip', price: 10 },
]

/** The Upper Sea: stairwright goods, cloud-honey and star-flares. */
export const SHOP_SKY: Stock = [
  { id: 'ration', price: 2 },
  { id: 'sw_pearltonic', price: 12 },
  { id: 'sw_cloudhoney', price: 14 },
  { id: 'sw_starflare', price: 8 },
  { id: 'sw_keg', price: 10 },
  { id: 'sw_sharkoil', price: 7 },
  { id: 'sw_coralsalve', price: 10 },
  { id: 'sw_coffee', price: 5 },
  { id: 'sw_tarredgrip', price: 10 },
]

export const with_ = (stock: Stock, ...extra: Stock): Stock => [...stock, ...extra]
