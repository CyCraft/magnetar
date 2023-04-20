import { DeepGet } from './DeepGet'
import { Split } from './Split'

export type DeepPropType<T extends Record<string, any>, PropPath extends string> = DeepGet<
  T,
  Split<PropPath, '.'>
>
