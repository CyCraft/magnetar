import { OPathsWithOptional, WhereClause, WhereClauseTuple, WhereFilterOp } from '@magnetarjs/types'

export type OPaths<T> = OPathsWithOptional<T>

/** You can pass a text parser which will be used for any `label` used throughout the table */
export type MUIParseLabel<LabelType = any> = (label: LabelType) => string

export type Codable<DataType, ReturnType> = (info: { value: any; data: DataType }) => ReturnType

export type MUIButton<T extends Record<string, any>, Label extends string = string> = {
  /** Executed on button click */
  handler: (info: { value: any; data: T }) => void | Promise<void>
  /** Applied to the innerText of the `<button>` */
  label: string | Label | Codable<T, string> | Codable<T, Label>
  /**
   * When `true` it will bind the `label` to the `innerHTML` of the `<button>` instead of the `innerText`.
   * Useful to pass SVGs as buttons or a bit more complex HTML to confine to some button CSS you use throughout your project.
   */
  html?: boolean
  /** Applied to the `<button>` */
  class?: string | Codable<T, string>
  /** Applied to the `<button>` */
  style?: string | Codable<T, string>
  /** Applied to the `<button>` */
  disabled?: boolean | undefined | Codable<T, boolean | undefined>
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
  class?: string | Codable<T, string>
  /** Applied to `td > div` */
  style?: string | Codable<T, string>
  /** When `true` this column will become sortable as per the Magnetar orderBy feature */
  sortable?:
    | boolean
    | {
        /**
         * If set to `true`, any interaction ordering this column will first clear out the orderBy state of other columns.
         */
        clearOtherOrderBy: boolean
      }
    | {
        /**
         * If set to `true`, any interaction ordering this column will first clear out the orderBy state of other columns.
         */
        clearOtherOrderBy?: boolean
        /** The initial orderBy state */
        orderBy: 'asc' | 'desc'
        position: number
      }
  /** Shows action buttons next to the cell value */
  buttons?: MUIButton<T, Label>[]
  /**
   * When `true` it will bind the `value` to the `innerHTML` of the `td > div > div` instead of the `innerText`.
   * You can still pass `buttons: []` as well which will render next to your html.
   *
   * @example
   * ```js
   * const column = {
   *   fieldPath: 'url',
   *   parseValue: ({ value }) => `<a href="${value}">${value}</a>`,
   *   html: true,
   * }
   * ```
   *
   * @example
   * ```js
   * const column = {
   *   fieldPath: 'imgUrl',
   *   parseValue: ({ value }) => `<img src="${value}" />`,
   *   html: true,
   * }
   * ```
   */
  html?: boolean
  /** When set this will be the name of the slot you can use to edit the column cells via Vue slots. */
  slot?: string
}

export type MUIPagination = {
  limit: number
}

export type MUIFilter<T extends Record<string, any>, Label extends string = string> =
  | MUIFilterOptions<T, Label>
  | MUIFilterOther<T, Label>

export type MUIFilterOther<T extends Record<string, any>, Label extends string = string> = {
  /**
   * The filter label, will also be piped through `parseLabel` if you passed it to the table.
   */
  label: Label
  /**
   * The `type` is passed to the `<input>` element.
   */
  type: 'text' | 'date' | 'number'
  /**
   * An array of where clauses, which will be combined with `||` (OR).
   *
   * The value of the where clause is what the user typed in the input field.
   * You must pass a function which parses the user input to the correct type as per your needs.
   * Usually applying `.trim()` as per the examples is a good idea.
   *
   * @example
   * ```js
   * const filter = {
   *   label: 'username',
   *   type: 'text',
   *   orWhere: [['username', '==', (userInput) => userInput.trim()]],
   * }
   * ```
   * @example
   * ```js
   * const filter = {
   *   label: 'amount',
   *   type: 'number',
   *   orWhere: [
   *     ['amountVAT', '>=', (userInput) => Number(userInput.trim())],
   *     ['profit', '>=', (userInput) => Number(userInput.trim())],
   *   ]
   * }
   * ```
   * @example
   * ```js
   * const filter = {
   *   label: 'date',
   *   type: 'date',
   *   orWhere: [
   *     ['dateCreated', '>=', (userInput) => new Date(userInput.trim())],
   *     ['dateUpdated', '>=', (userInput) => new Date(userInput.trim())],
   *   ]
   * }
   * ```
   */
  where:
    | [fieldPath: OPaths<T>, operator: WhereFilterOp, parseInput: (userInput: string) => any]
    | {
        or?: [
          fieldPath: OPaths<T>,
          operator: WhereFilterOp,
          parseInput: (userInput: string) => any
        ][]
      }
  /**
   * If set to `true`, any interaction with this filter will first clear out _other_ filters state.
   */
  clearOtherFilters?: boolean
  /**
   * If set to `true`, any interaction with this filter will first clear out the orderBy state.
   */
  clearOrderBy?: boolean
  /**
   * some text shown leading in front of the `<input>` field.
   * @example '>='
   * @example 'starts with'
   * @example '€'
   */
  prefix?: string | Label
  /**
   * some text shown trailing behind the `<input>` field.
   * @example 'kg'
   * @example 'JPY'
   */
  suffix?: string | Label
  /**
   * Applied to `<fieldset>`
   * @example 'flex-column'
   */
  class?: string
  /**
   * Applied to `<fieldset>`
   * @example 'display: flex; flex-direction: column;'
   */
  style?: string
  /**
   * Text placeholder which will be displayed inside the input field.
   * @example 'search...'
   */
  placeholder?: Label
  /**
   * Not available for `type: 'text' | 'date' | 'number'`.
   */
  options?: undefined
}

export type MUIFilterOptions<T extends Record<string, any>, Label extends string = string> = {
  /**
   * The filter label, will also be piped through `parseLabel` if you passed it to the table.
   */
  label: Label
  type: 'select' | 'checkboxes' | 'radio'
  options: {
    label: Label
    where: WhereClauseTuple<T>
    checked?: boolean
  }[]
  /**
   * If set to `true`, any interaction with this filter will first clear out _other_ filters state.
   */
  clearOtherFilters?: boolean
  /**
   * If set to `true`, any interaction with this filter will first clear out the orderBy state.
   */
  clearOrderBy?: boolean
  /**
   * Applied to `<fieldset>`
   * @example 'flex-column'
   */
  class?: string
  /**
   * Applied to `<fieldset>`
   * @example 'display: flex; flex-direction: column;'
   */
  style?: string
  /**
   * Text placeholder which will be displayed inside the `<select>` field.
   * @example 'select...'
   */
  placeholder?: Label
  /** not available for `'select' | 'checkboxes' | 'radio'`. */
  orWhere?: undefined
  /** not available for `'select' | 'checkboxes' | 'radio'`. */
  prefix?: undefined
  /** not available for `'select' | 'checkboxes' | 'radio'`. */
  suffix?: undefined
}

export type MUIRows<T extends Record<string, any>> = T[]

export type FilterStateOr = { or: Set<WhereClause> }
export type FilterStateSingle = WhereClause
export type FilterState = FilterStateOr | FilterStateSingle

/**
 * A map of the filter index with the where clauses to be applied.
 *
 * - `type: 'checkboxes' | 'text' | 'number' | 'date'` needs to save its state as `{ or: Set<WhereClause> }`
 * - `type: 'select' | 'radio'` needs to save its state as `WhereClause`
 */
export type FiltersState = Map<number, FilterState>

export function usesFilterStateOr(
  filter: MUIFilter<any>,
  state?: FilterState
): state is FilterStateOr | undefined {
  return (
    filter.type === 'checkboxes' ||
    filter.type === 'text' ||
    filter.type === 'number' ||
    filter.type === 'date'
  )
}

export function usesFilterStateSingle(
  filter: MUIFilter<any>,
  state?: FilterState
): state is FilterStateSingle | undefined {
  return filter.type === 'select' || filter.type === 'radio'
}

/**
 * This map is order-sensitive. `orderBy(...)` is applied in the insert order of this map
 */
export type OrderByState = Map<OPaths<any>, 'asc' | 'desc'>

export type MUILabel =
  | 'magnetar table record counts'
  | 'magnetar table fetch-state error default'
  | 'magnetar table info counts total'
  | 'magnetar table info counts filtered'
  | 'magnetar table info counts showing'
  | 'magnetar table fetch-state reset'
  | 'magnetar table filters'
  | 'magnetar table active filters'
  | 'magnetar table show filters code'
  | 'magnetar table clear filters button'
  | 'magnetar table no active filters'
  | 'magnetar table no-results'
  | 'magnetar table fetch-more button'
  | 'magnetar table fetch-more button end'

export const muiLabelDic: Record<MUILabel, string> = {
  'magnetar table record counts': 'Found Record Counts',
  'magnetar table fetch-state error default': 'An error occured, check the console',
  'magnetar table info counts total': 'total',
  'magnetar table info counts filtered': 'filtered',
  'magnetar table info counts showing': 'showing',
  'magnetar table fetch-state reset': 'Reset to Defaults',
  'magnetar table filters': 'Filters',
  'magnetar table show filters code': 'Show Code',
  'magnetar table active filters': 'Active Filters',
  'magnetar table no active filters': 'No Filters Active',
  'magnetar table clear filters button': 'Clear All',
  'magnetar table no-results': 'No results found',
  'magnetar table fetch-more button': 'Fetch More',
  'magnetar table fetch-more button end': 'Fetched Everything!',
}
