import { TupleExcludingFirst, TupleFirst } from './Tuple.js'

export type DeepGet<T, K extends readonly unknown[]> = K extends []
  ? T
  : T extends { [Q in TupleFirst<K> & PropertyKey]: unknown }
  ? DeepGet<T[TupleFirst<K> & keyof T], TupleExcludingFirst<K>>
  : Required<T> extends { [Q in TupleFirst<K> & PropertyKey]: unknown }
  ? DeepGet<Required<T>[TupleFirst<K> & keyof T] | undefined, TupleExcludingFirst<K>>
  : never
