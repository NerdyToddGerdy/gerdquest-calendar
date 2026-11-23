import type { ReactNode } from 'react'
import type { ItemDef } from '../engine/types'
import { itemEffect } from './itemEffect'

/**
 * Item name that shows what the item does on hover — or on focus, so it
 * works from the keyboard and with a tap on touch screens.
 */
export function ItemTip({ item, children }: { item: ItemDef; children?: ReactNode }) {
  const id = `tip-${item.id}`
  return (
    <span className="item-tip" tabIndex={0} aria-describedby={id}>
      {children ?? item.name}
      <span role="tooltip" id={id} className="item-tip-box">
        <b>{item.name}</b>
        <span>{item.text}</span>
        {itemEffect(item) && <span className="item-tip-effect">{itemEffect(item)}</span>}
      </span>
    </span>
  )
}
