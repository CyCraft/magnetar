/**
 * Joins a list into a dot notation path
 */
type Join<K, P> = K extends string | number
  ? P extends string | number
    ? `${K}${'' extends P ? '' : '.'}${P}`
    : never
  : never

// prettier-ignore
type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, ...0[]]

/**
 * All possible Object Paths
 * @example OPaths<{ a: { b: number } }>
 * // returns ['a', 'a.b']
 */
export type OPaths<T, D extends number = 10> = [D] extends [never]
  ? never
  : T extends Record<string, any>
  ? {
      [K in keyof T]-?: K extends string | number ? `${K}` | Join<K, OPaths<T[K], Prev[D]>> : never
    }[keyof T]
  : ''
