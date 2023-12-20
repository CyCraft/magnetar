/**
 * Converts `['a', '==', 123]` into `"a", "==", 123`
 */
export function arrStr(clause: any[]): string {
  return clause.map((part) => JSON.stringify(part)).join(', ')
}
