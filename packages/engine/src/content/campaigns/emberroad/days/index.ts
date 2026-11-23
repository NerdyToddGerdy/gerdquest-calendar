// The Ember Road — every page of the year, in order.
// January's opening arc (Jan 1–30) carries explicit dates; the rest of the
// year is written month by month and dated by `datePages`.
import type { Day } from '../../../../engine/types'
import { datePages } from './build'
import { APR } from './apr'
import { FEB, JAN_TAIL } from './feb'
import { JAN } from './jan'
import { DEC } from './dec'
import { NOV } from './nov'
import { OCT } from './oct'
import { SEP } from './sep'
import { AUG } from './aug'
import { JUL } from './jul'
import { JUN } from './jun'
import { MAY } from './may'
import { MAR } from './mar'

export const DAYS: Day[] = [
  ...JAN,
  ...datePages(
    '2022-01-31',
    [
      [1, JAN_TAIL],
      [2, FEB],
      [3, MAR],
      [4, APR],
      [5, MAY],
      [6, JUN],
      [7, JUL],
      [8, AUG],
      [9, SEP],
      [10, OCT],
      [11, NOV],
      [12, DEC],
    ],
    JAN.length + 1,
  ),
]
