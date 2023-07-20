import { OPathsWithOptional, WhereClauseTuple, WhereFilterOp } from '@magnetarjs/types'

export type OPaths<T> = OPathsWithOptional<T>

/** You can pass a text parser which will be used for any `label` used throughout the table */
export type MUIParseLabel<LabelType = any> = (label: LabelType) => string

export type MUIButton<T extends Record<string, any>, Label extends string = string> = {
  label: Label | ((info: { value: any; data: T }) => Label)
  handler: (info: { value: any; data: T }) => void | Promise<void>
  disabled?: (info: { value: any; data: T }) => boolean | undefined
}

export type MUIColumn<T extends Record<string, any>, Label extends string = string> = {
  /**
   * - Defaults to whatever you passed in `fieldPath`.
   * - Pass an empty string if you want to show nothing.
   */
  label?: Label
  /**
   * Represents the path to the prop that should be shown in this column for each data item.
   * No need to pass if the value doesn't matter for a column, because you want to show a combination of 2 columns with the `parseValue` function
   * @example 'name' // would show `data.name`
   * @example 'name.family' // would show `data.name.family`
   * @example undefined // an empty column, you can use `parseValue` to show something else
   */
  fieldPath?: OPaths<T>
  /**
   * Parses the value to be shown
   * @example ({ value }) => value > 10 ? 'lg' : 'sm'
   * @example ({ value }) => !!value ? '✅' : '❌'
   * @example ({ data }) => data.name.family + ' ' + data.name.given
   */
  parseValue?: (info: { value: any; data: T }) => string
  /** Applied to `td > div` */
  class?: string | ((info: { value: any; data: T }) => string)
  /** Applied to `td > div` */
  style?: string | ((info: { value: any; data: T }) => string)
  /** When `true` this column will become sortable as per the Magnetar orderBy feature */
  sortable?: boolean | { orderBy: 'asc' | 'desc'; position: number }
  /** Shows action buttons next to the cell value */
  buttons?: MUIButton<T, Label>[]
  /**
   * You can define a function as your markdown parser. Whatever value will be parsed as markdown content, and shows inside the cell with `v-html`.
   * - first executes `parseValue` if defined
   * - if your value is not a string, you need to define `parseValue` which MUST convert it to a string
   * ```html
   * <div v-html="starkdown(parseValue({ value, data }))" />
   * ```
   * @example
   * ```
   * import { starkdown } from 'starkdown'
   * const column: MUIColumn<Record<string, any>> = {
   *   // ...
   *   parseMarkdown: starkdown
   * }
   * ```
   */
  parseMarkdown?: (text: string) => string
}

export type MUIPagination = {
  limit: number
}

export type MUIFilter<
  T extends Record<string, any>,
  Label extends string = string,
  Path extends OPaths<T> = OPaths<T>,
  WhereOp extends WhereFilterOp = WhereFilterOp
> = MUIFilterOptions<T, Label, Path, WhereOp> | MUIFilterOther

/**
 * TODO: not yet implemented!!
 */
export type MUIFilterOther<Label extends string = string> = {
  label: Label
  /**
   * TODO: not yet implemented!!
   */
  type: 'text' | 'date' | 'dateRange' | 'number'
  /** not available */
  options?: undefined
}

export type MUIFilterOptions<
  T extends Record<string, any>,
  Label extends string = string,
  Path extends OPaths<T> = OPaths<T>,
  WhereOp extends WhereFilterOp = WhereFilterOp
> = {
  label: Label
  type: 'select' | 'checkboxes' | 'radio'
  options: {
    label: Label
    where: WhereClauseTuple<T, Path, WhereOp>
    checked?: boolean
  }[]
}

export type MUIRows<T extends Record<string, any>> = T[]

export type FilterState = Map<WhereClauseTuple<any, any, any>, boolean>
/**
 * This map is order-sensitive. `orderBy(...)` is applied in the insert order of this map
 */
export type OrderByState = Map<OPaths<any>, 'asc' | 'desc'>

export type MUILabel =
  | 'magnetar table fetch-state error default'
  | 'magnetar table info counts total'
  | 'magnetar table info counts filter'
  | 'magnetar table info counts showing'
  | 'magnetar table fetch-state reset'
  | 'magnetar table active filters'
  | 'magnetar table clear filters button'
  | 'magnetar table no-results'
  | 'magnetar table fetch-more button'
  | 'magnetar table fetch-more button end'

export const muiLabelDic = {
  'magnetar table fetch-state error default': 'An error occured, check the console',
  'magnetar table info counts total': 'total',
  'magnetar table info counts filter': 'filter',
  'magnetar table info counts showing': 'showing',
  'magnetar table fetch-state reset': 'Reset to Defaults',
  'magnetar table active filters': 'Active Filters',
  'magnetar table clear filters button': 'Clear All',
  'magnetar table no-results': 'No results found',
  'magnetar table fetch-more button': 'Fetch More',
  'magnetar table fetch-more button end': 'Fetched Everything!',
}
