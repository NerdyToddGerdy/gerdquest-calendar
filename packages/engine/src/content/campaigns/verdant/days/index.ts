// The Verdant Accord — every page of Chapters 1–4, in order, dated against 2022
// (Jan 1 was a Saturday, so the year opens on a Sat/Sun weekend page).
// Chapters 5–12 are added here as they are written.
import type { Day } from '../../../../engine/types'
import { datePages } from './build'
import { M1 } from './m1'
import { M2 } from './m2'
import { M3 } from './m3'
import { M4 } from './m4'

export const DAYS: Day[] = datePages('2022-01-01', [
  [1, M1],
  [2, M2],
  [3, M3],
  [4, M4],
])
