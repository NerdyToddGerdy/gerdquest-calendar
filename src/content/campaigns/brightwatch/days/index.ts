import type { Day } from '../../../../engine/types'
import { day01 } from './day01'
import { day02 } from './day02'
import { day03 } from './day03'
import { day04 } from './day04'
import { day05 } from './day05'
import { day06 } from './day06'
import { WEEK2 } from './week2'
import { WEEK3 } from './week3'
import { WEEK4 } from './week4'
import { WEEK5 } from './week5'
import { WEEK6 } from './week6'
import { WEEK7 } from './week7'
import { YEAR } from './year'

/** Week 1 — Wren Ashvale, Lantern Warden: arrival, the cellars, the Drowned Keeper. */
const WEEK1: Day[] = [day01, day02, day03, day04, day05, day06]

/**
 * Pages in play order. Each page carries its calendar month/day (2024: Jan 1
 * was a Monday); Saturday + Sunday share one weekend page (`span: 2`).
 * Weeks 1–6 are the hero trial (one warden per week), week 7 opens with the
 * player choosing which warden carries the story. The rest of the year
 * (Feb 19 – Dec 31) follows in the month files; see ../YEAR.md.
 */
export const DAYS: Day[] = [...WEEK1, ...WEEK2, ...WEEK3, ...WEEK4, ...WEEK5, ...WEEK6, ...WEEK7, ...YEAR]
