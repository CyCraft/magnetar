/**
 * Check whether `A1` is equal to `A2` or not.
 * @param A1
 * @param A2
 * @returns [[Boolean]]
 * @example
 * ```ts
 * import {A} from 'ts-toolbelt'
 *
 * type test0 = A.Equals<42 | 0, 42 | 0>                    // true
 * type test1 = A.Equals<{a: string}, {b: string}>          // false
 * type test3 = A.Equals<{a: string}, {readonly a: string}> // false
 * ```
 */
export declare type Equals<A1, A2> = (<A>() => A extends A2 ? 1 : 0) extends <A>() => A extends A1
  ? 1
  : 0
  ? 1
  : 0

/**
 * Get the overlapping members of `U1` and `U2`
 * @param U1
 * @param U2
 * @returns [[Union]]
 * @example
 * ```ts
 * ```
 */
export declare type Intersect<U1, U2> = U1 extends unknown
  ? U2 extends unknown
    ? {
        1: U1
        0: never
      }[Equals<U1, U2>]
    : never
  : never

/**
 * Returns the type for string literals.
 *
 * When the type is an empty string literal `''` or a generic `string` it returns `never`
 */
type IsFullStringLiteral<T> = T extends string ? ('' extends T ? false : true) : false

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
  : Intersect<T, null | undefined> extends never
  ? T extends Record<string, any>
    ? {
        [K in keyof T]-?: K extends string ? `${K}` | Join<K, OPaths<T[K], Prev[D]>> : never
      }[keyof T]
    : ''
  : ''

/**
 * All possible Object Paths, but only the leaves
 * @example OPaths<{ a: { b: number } }>
 * // returns 'a.b'
 */
export type OLeaves<T, D extends number = 10> = [D] extends [never]
  ? ''
  : Intersect<T, null | undefined> extends never
  ? T extends Record<string, any>
    ? {
        [K in keyof T]-?: IsFullStringLiteral<K> extends true ? Join<K, OLeaves<T[K], Prev[D]>> : ''
      }[keyof T]
    : ''
  : ''

// type Test = {
//   a: { b: { c: { d: number; e: number } }; inA: string }
//   x: string[]
//   y: { name: string } | undefined
//   z: { [key in string]: { zzz: number[] } }
//   z123: { a123: { [key in string]: { zzz: number[] } } }
// }

// export type FlatTestPaths = OPaths<Test, 4>
// export type FlatTestLeaves = OLeaves<Test, 4>
