/**
 * Returns a _deep_ Partial of `O`, where all props & nested props are optional
 * @param O the object to make optional
 * @example
 * ```ts
 * type MyObject = { nested: { props: string } }
 *
 * PartialDeep<MyObject>
 * // returns
 * // { nested?: { props?: string } }
 * ```
 */
export type PartialDeep<O> = O extends { [key: string | number | symbol]: unknown }
  ? { [K in keyof O]?: PartialDeep<O[K]> }
  : O

// type A = { a: { b: string[] } }
// type TestA = PartialDeep<A>
