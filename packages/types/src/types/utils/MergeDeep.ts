import type { Merge } from 'merge-anything'

export type MergeDeep<
  A0 extends { [key: string | number | symbol]: unknown },
  A1 extends { [key: string | number | symbol]: unknown }
> = Merge<A0, [A1]>
