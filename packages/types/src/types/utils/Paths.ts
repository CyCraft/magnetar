import { EqualsAnyOfUnion, IsFullStringLiteral } from './Equals'

/**
 * Joins two keys into a dot notation path
 *
 * Stops at arrays. Otherwise it would include `${number}`
 */
type Join<K, P> = K extends string
  ? P extends string
    ? IsFullStringLiteral<P> extends true
      ? `${K}.${P}`
      : K
    : P extends number
    ? K
    : never
  : never

// prettier-ignore
type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, ...0[]]

/**
 * All possible Object Paths, branches AND leaves
 * @example OPaths<{ a: { b: number } }>
 * // returns 'a' | 'a.b'
 */
export type OPaths<T, D extends number = 10> = [D] extends [never]
  ? never
  : EqualsAnyOfUnion<T, null | undefined> extends 1
  ? ''
  : T extends Record<string, any>
  ? {
      [K in keyof T]-?: K extends string ? `${K}` | Join<K, OPaths<T[K], Prev[D]>> : never
    }[keyof T]
  : ''

/**
 * All possible Object Paths, but only the leaves
 * @example OPaths<{ a: { b: number } }>
 * // returns 'a.b'
 */
export type OLeaves<T, D extends number = 10> = [D] extends [never]
  ? ''
  : EqualsAnyOfUnion<T, null | undefined> extends 1
  ? ''
  : T extends Record<string, any>
  ? {
      [K in keyof T]-?: IsFullStringLiteral<K> extends true ? Join<K, OLeaves<T[K], Prev[D]>> : ''
    }[keyof T]
  : ''

// type Test = {
//   a: { b: { c: { d: number; e: number } }; inA: string }
//   x: string[]
//   y: { name: string } | undefined
//   z: { [key in string]: { zzz: number[] } }
//   z123: { a123: { [key in string]: { zzz: number[] } } }
// }

// export type FlatTestPaths = OPaths<Test>
// export type FlatTestLeaves = OLeaves<Test>
