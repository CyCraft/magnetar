import { DeepGet } from './DeepGet.js'
import { Split } from './Split.js'

export type DeepPropType<T extends { [key: string]: any }, PropPath extends string> = DeepGet<
  T,
  Split<PropPath, '.'>
>
