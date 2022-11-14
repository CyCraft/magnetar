/**
 * Check whether `A1` is equal to `A2` or not.
 * @param A1
 * @param A2
 * @returns [[Boolean]]
 * @example
 * ```ts
 * type test0 = Equals<42 | 0, 42 | 0>                     // 1
 * type test1 = Equals<{ a: string}, {b: string}>          // 0
 * type test3 = Equals<{ a: string}, {readonly a: string}> // 0
 * ```
 */
export type Equals<A1, A2> = (<A>() => A extends A2 ? 1 : 0) extends <A>() => A extends A1 ? 1 : 0
  ? 1
  : 0

// type A = undefined
// type B = Equals<A, undefined | null> extends 1 ? number : () => void
// type C = { 1: number; 0: () => void }[Equals<A, undefined | null>]

/**
 * Get the overlapping members of `U1` and `U2`
 * @param U1
 * @param U2
 * @returns [[Union]]
 * @example
 * ```ts
 * ```
 */
export type Intersect<U1, U2> = U1 extends unknown
  ? U2 extends unknown
    ? {
        1: U1
        0: never
      }[Equals<U1, U2>]
    : never
  : never

export type EqualsAnyOfUnion<A1, A2> = Intersect<A1, A2> extends never ? 0 : 1

// type A = undefined
// type B = EqualsAnyOfUnion<A, undefined | null> extends 1 ? number : () => void
// type C = { 1: number; 0: () => void }[EqualsAnyOfUnion<A, undefined | null>]

/**
 * Returns the type for string literals.
 *
 * When the type is an empty string literal `''` or a generic `string` it returns `never`
 */
export type IsFullStringLiteral<T> = T extends string ? ('' extends T ? false : true) : false
