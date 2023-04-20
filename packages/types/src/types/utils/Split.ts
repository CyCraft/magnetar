export type Split<
  Str extends string,
  Delimiter extends string
> = Str extends `${infer Left}${Delimiter}${infer Right}`
  ? [Left, ...Split<Right, Delimiter>]
  : [Str]
