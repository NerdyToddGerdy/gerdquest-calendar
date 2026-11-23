// Market stock for the Ember Road year, tiered as the road (and prices) climb.

type Stock = { id: string; price: number }[]

/** Late winter: basics. */
export const SHOP_WINTER: Stock = [
  { id: 'ration', price: 1 },
  { id: 'er_draught', price: 5 },
  { id: 'er_firepot', price: 4 },
  { id: 'er_tonic', price: 3 },
  { id: 'er_linen', price: 6 },
  { id: 'er_spicedwine', price: 3 },
]

/** Spring: the first upgrades and better medicine. */
export const SHOP_SPRING: Stock = [
  { id: 'ration', price: 1 },
  { id: 'er_draught', price: 6 },
  { id: 'er_firepot', price: 5 },
  { id: 'er_tonic', price: 4 },
  { id: 'er_poultice', price: 9 },
  { id: 'er_oakheart', price: 4 },
  { id: 'er_whetstone', price: 7 },
  { id: 'er_temper', price: 8 },
]

/** Summer: forge goods, greater draughts, fair treats. */
export const SHOP_SUMMER: Stock = [
  { id: 'ration', price: 2 },
  { id: 'er_draught', price: 6 },
  { id: 'er_greater', price: 10 },
  { id: 'er_blastpot', price: 9 },
  { id: 'er_steelbrew', price: 6 },
  { id: 'er_poultice', price: 9 },
  { id: 'er_honeycake', price: 4 },
  { id: 'er_whetstone', price: 8 },
  { id: 'er_temper', price: 9 },
]

/** Autumn and the war: everything costs more. */
export const SHOP_AUTUMN: Stock = [
  { id: 'ration', price: 2 },
  { id: 'er_greater', price: 12 },
  { id: 'er_blastpot', price: 10 },
  { id: 'er_steelbrew', price: 7 },
  { id: 'er_poultice', price: 10 },
  { id: 'er_owlwine', price: 5 },
  { id: 'er_rune', price: 14 },
  { id: 'er_temper', price: 10 },
]

/** Deep winter, at the end of the road. */
export const SHOP_LONGNIGHT: Stock = [
  { id: 'ration', price: 3 },
  { id: 'er_greater', price: 14 },
  { id: 'er_blastpot', price: 12 },
  { id: 'er_steelbrew', price: 8 },
  { id: 'er_poultice', price: 12 },
  { id: 'er_owlwine', price: 6 },
  { id: 'er_rune', price: 16 },
]

export const with_ = (stock: Stock, ...extra: Stock): Stock => [...stock, ...extra]
