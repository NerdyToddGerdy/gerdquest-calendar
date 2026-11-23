// The Halcyon Debt — the whole year, in calendar order (see ../YEAR.md).
// Each month file holds the weeks whose Monday falls in that month.
import type { Day } from '../../../../engine/types'
import { APR } from './apr'
import { AUG } from './aug'
import { DEC } from './dec'
import { FEB } from './feb'
import { JAN } from './jan'
import { JUL } from './jul'
import { JUN } from './jun'
import { MAR } from './mar'
import { MAY } from './may'
import { NOV } from './nov'
import { OCT } from './oct'
import { SEP } from './sep'

export const PAGES: Day[] = [...JAN, ...FEB, ...MAR, ...APR, ...MAY, ...JUN, ...JUL, ...AUG, ...SEP, ...OCT, ...NOV, ...DEC]
