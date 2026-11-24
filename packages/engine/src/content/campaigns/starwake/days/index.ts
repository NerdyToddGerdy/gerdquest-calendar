// The Starwake — every page of the whole year, in order, dated against 2022
// (Jan 1 was a Saturday, so the voyage opens on a Sat/Sun weekend page).
import type { Day } from '../../../../engine/types'
import { datePages } from './build'
import { M1 } from './m1'
import { M2 } from './m2'
import { M3 } from './m3'
import { M4 } from './m4'
import { M5 } from './m5'
import { M6 } from './m6'
import { M7 } from './m7'
import { M8 } from './m8'
import { M9 } from './m9'
import { M10 } from './m10'
import { M11 } from './m11'
import { M12 } from './m12'

export const DAYS: Day[] = datePages('2022-01-01', [
  [1, M1],
  [2, M2],
  [3, M3],
  [4, M4],
  [5, M5],
  [6, M6],
  [7, M7],
  [8, M8],
  [9, M9],
  [10, M10],
  [11, M11],
  [12, M12],
])
