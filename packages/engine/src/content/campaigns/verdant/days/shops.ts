// Market stock for The Verdant Accord, tiered as the year (and prices) climb.

type Stock = { id: string; price: number }[]

/** Cobbleford and the Greenway inns. */
export const SHOP_ROAD: Stock = [
  { id: 'ration', price: 1 },
  { id: 'va_fernleaf', price: 5 },
  { id: 'va_firepot', price: 4 },
  { id: 'va_cider', price: 3 },
  { id: 'va_mossbalm', price: 6 },
  { id: 'va_honeycake', price: 3 },
]

/** Highmarrow's markets: the first upgrades and gear. */
export const SHOP_CITY: Stock = [
  { id: 'ration', price: 1 },
  { id: 'va_fernleaf', price: 5 },
  { id: 'va_firepot', price: 4 },
  { id: 'va_cider', price: 3 },
  { id: 'va_mossbalm', price: 6 },
  { id: 'va_jerky', price: 3 },
  { id: 'va_whetstone', price: 6 },
  { id: 'va_grip', price: 7 },
  { id: 'va_feltcap', price: 9 },
  { id: 'va_drovercoat', price: 10 },
]

/** The city's better shops, once you're known there. */
export const SHOP_FINE: Stock = [
  { id: 'ration', price: 2 },
  { id: 'va_fernleaf', price: 6 },
  { id: 'va_heartsap', price: 10 },
  { id: 'va_blastjar', price: 9 },
  { id: 'va_wasp', price: 6 },
  { id: 'va_mossbalm', price: 7 },
  { id: 'va_bitterroot', price: 4 },
  { id: 'va_whetstone', price: 7 },
  { id: 'va_grip', price: 8 },
  { id: 'va_picks', price: 5 },
  { id: 'va_compass', price: 12 },
  { id: 'va_fordboots', price: 12 },
]
