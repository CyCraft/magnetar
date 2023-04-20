export type TupleOf<
  Value,
  Length extends number,
  Result extends readonly Value[] = []
> = Result['length'] extends Length ? Result : TupleOf<Value, Length, [...Result, Value]>

export type TupleFirst<Tuple extends readonly unknown[]> = Tuple extends Readonly<
  [infer Head, ...(readonly unknown[])]
>
  ? Head
  : never

export type TupleExcludingFirst<Tuple extends readonly unknown[]> = Tuple extends Readonly<
  [unknown, ...infer Tail]
>
  ? Tail
  : never

export type TupleLast<Tuple extends readonly unknown[]> = Tuple extends Readonly<
  [...infer _, infer Last]
>
  ? Last
  : never

export type TupleExcludingLast<Tuple extends readonly unknown[]> = Tuple extends Readonly<
  [...infer Rest, unknown]
>
  ? Rest
  : never
