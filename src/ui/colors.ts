/** A stable accent per campaign tab, so calendar markers and tabs can be told apart. */
export function campColor(i: number): string {
  return ['#e8b25a', '#4fa3c7', '#b86fc4', '#6cc48f', '#e07a5a', '#9aa7ff'][i % 6]
}
