import type { Merge } from 'merge-anything'

export type MergeDeep<
  A0 extends Record<string | number | symbol, unknown>,
  A1 extends Record<string | number | symbol, unknown>
> = Merge<A0, [A1]>
