import { OPathsWithOptional, WhereClause, WhereClauseTuple, WhereFilterOp } from '@magnetarjs/types'
import { Ref } from 'vue'

export type OPaths<T> = OPathsWithOptional<T>

export type MUITableSlot<T = any> = { data: T; isExpanded: Ref<boolean> }

/** You can pass a text parser which will be used for any `label` used throughout the table */
export type MUIParseLabel<LabelType = any> = (label: LabelType) => string

export type Codable<DataType, ReturnType> = (info: {
  value: any
  data: DataType
  isExpanded: boolean
}) => ReturnType

export type MUIButton<T extends Record<string, any>, Label = string> = {
  /** Executed on button click */
  handler: (info: { value: any; data: T; isExpanded: Ref<boolean> }) => void | Promise<void>
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

export type MUIColumn<T extends Record<string, any>, Label = string> = {
  /**
   * - Defaults to whatever you passed in `fieldPath`.
   * - Pass an empty string if you want to show nothing.
   */
  label?: Label
  /**
   * Represents the path to the prop that should be shown in this column for each data item.
   * No need to pass if the value doesn't matter for a column, because you want to show a combination of 2 columns with the `parseValue` function.
   *
   * The data to be shown in a cell is calculated by any of the following props. They cannot be combined, choose only 1 of:
   * - `slot`
   * - `fetchValue`
   * - `fieldPath`
   *
   * @example 'name' // would show `data.name`
   * @example 'name.family' // would show `data.name.family`
   * @example undefined // an empty column, you can use `parseValue` to show something else
   */
  fieldPath?: OPaths<T>
  /**
   * A function that parses the value to be shown.
   * The function will receive an object with these props:
   * - `data` — the row data
   * - `value` —
   *   - if `fieldPath` it provided, the value found at that `fieldPath`
   *   - if `fetchValue` it provided, the value that was fetched
   *   - else `undefined`
   *
   * @example ({ value }) => value > 10 ? 'lg' : 'sm'
   * @example ({ value }) => !!value ? '✅' : '❌'
   * @example ({ data }) => data.name.family + ' ' + data.name.given
   */
  parseValue?: (info: { value: any; data: T }) => string
  /**
   * Fetches a value to be shown. When passing this, the `fieldPath` prop will be ignored.
   *
   * Under the hood this uses `computedAsync` from [vueuse](https://vueuse.org/core/computedAsync/).
   *
   * The data to be shown in a cell is calculated by any of the following props. They cannot be combined, choose only 1 of:
   * - `slot`
   * - `fetchValue`
   * - `fieldPath`
   *
   * @example
   * ```js
   * async ({ data }) => {
   *   const user = await magnetar.collection('users').doc(data.userIdCreated).fetch()
   *   return user.name
   * }
   * ```
   */
  fetchValue?: (info: { data: T }) => Promise<any>
  /** Applied to `td > div` */
  class?: string | Codable<T, string>
  /** Applied to `td > div` */
  style?: string | Codable<T, string>
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
  /**
   * When set this will be the name of the slot you can use to edit the column cells via Vue slots.
   *
   * The data to be shown in a cell is calculated by any of the following props. They cannot be combined, choose only 1 of:
   * - `slot`
   * - `fetchValue`
   * - `fieldPath`
   */
  slot?: string
  /**
   * The column can be made sortable which will use the Magnetar orderBy feature under the hood
   *
   * In most cases you'll want to set `{ clearOtherOrderBy: true }` to make sure only 1 column is sorted at a time:
   * @example
   * ```js
   * sortable: { clearOtherOrderBy: true }
   * ```
   *
   * You can have a column have an initial sort state:
   * @example
   * ```js
   * sortable: { orderBy: 'desc', position: 0, clearOtherOrderBy: true }
   * ```
   */
  sortable?:
    | boolean
    | {
        /** If set to `true`, any interaction ordering this column will first clear out the orderBy state of other columns */
        clearOtherOrderBy?: boolean
        /** The initial orderBy state, can be left unset if no initial orderBy state is needed */
        orderBy?: 'asc' | 'desc'
        /** The position of the orderBy state, required in case there are more columns with initial orderBy state set */
        position?: number
      }
}

export type MUIPagination = {
  limit: number
  /** @default 'fetch-more' */
  kind?: 'fetch-more' | 'previous-next'
}

export type MUIFilter<T extends Record<string, any>, Label = string> = {
  /**
   * The filter label, will also be piped through `parseLabel` if you passed it to the table.
   *
   * The filter label will be rendered as the `<legend />` element of the filter <fieldset />.
   */
  label: Label
  /**
   * The type of filter.
   * - `'radio'` — renders radio buttons via `<input type="radio" />`
   * - `'checkboxes'` — renders checkboxes via `<input type="checkbox" />`
   * - `'select'` — renders a `<select />` element
   * - `'text'` — renders a `<input type="text" />` element
   * - `'date'` — renders a `<input type="date" />` element
   * - `'number'` — renders a `<input type="number" />` element
   *
   * The filter will be rendered inside a `<fieldset />` element.
   */
  type: 'radio' | 'checkboxes' | 'select' | 'text' | 'date' | 'number'
  /**
   * The options to be rendered for the radio/select/checkboxes filter.
   *
   * - `type: 'select' | 'checkboxes' | 'radio'`
   *   - available
   * - `type: 'text' | 'date' | 'number'`
   *   - not available
   */
  options?: {
    label: Label
    where: WhereClauseTuple<T>
    checked?: boolean
  }[]
  /**
   * - `type: 'text' | 'date' | 'number'`
   *   - use either `where` OR `query`
   * - `type: 'select' | 'checkboxes' | 'radio'`
   *   - not available, use `options` instead
   *
   * The value of the where clause is what the user typed in the input field.
   * You must pass a function which parses the user input to the correct type as per your needs.
   * Usually applying `.trim()` as per the examples is a good idea.
   *
   * @example
   * ```js
   * const filter = {
   *   label: 'Search',
   *   placeholder: 'user ID',
   *   type: 'text',
   *   where: ['id', '==', (userInput) => userInput.trim()],
   * }
   * ```
   * @example
   * ```js
   * const filter = {
   *   label: 'amountVAT',
   *   type: 'number',
   *   where: ['amountVAT', '>=', (userInput) => Number(userInput.trim())],
   * }
   * ```
   * @example
   * ```js
   * const filter = {
   *   label: 'dateCreated',
   *   type: 'date',
   *   where: ['dateCreated', '>=', (userInput) => new Date(userInput.trim())],
   * }
   * ```
   */
  where?: [fieldPath: OPaths<T>, operator: WhereFilterOp, parseInput: (userInput: string) => any]
  /**
   * - `type: 'text' | 'date' | 'number'`
   *   - use either `where` OR `query`
   * - `type: 'select' | 'checkboxes' | 'radio'`
   *   - not available, use `options` instead
   *
   * The value of the where clause is what the user typed in the input field.
   * You must pass a function which parses the user input to the correct type as per your needs.
   * Usually applying `.trim()` as per the examples is a good idea.
   *
   * @example
   * ```js
   * const filter = {
   *   label: 'Search',
   *   placeholder: 'user ID, username, ...',
   *   type: 'text',
   *   query: {
   *     or: [
   *       ['username', '>=', (userInput) => Number(userInput.trim())],
   *       ['username', '>=', (userInput) => Number(userInput.toLowerCase().trim())],
   *       ['id', '>=', (userInput) => Number(userInput.trim())],
   *     ]
   *   }
   * }
   * ```
   * @example
   * ```js
   * const filter = {
   *   label: 'amount',
   *   type: 'number',
   *   query: {
   *     or: [
   *       ['amountVAT', '>=', (userInput) => Number(userInput.trim())],
   *       ['profit', '>=', (userInput) => Number(userInput.trim())],
   *     ]
   *   }
   * }
   * ```
   * @example
   * ```js
   * const filter = {
   *   label: 'date',
   *   type: 'date',
   *   query: {
   *     or: [
   *       ['dateCreated', '>=', (userInput) => new Date(userInput.trim())],
   *       ['dateUpdated', '>=', (userInput) => new Date(userInput.trim())],
   *     ]
   *   }
   * }
   * ```
   */
  query?: {
    or: [fieldPath: OPaths<T>, operator: WhereFilterOp, parseInput: (userInput: string) => any][]
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
   * - `type: 'text' | 'date' | 'number'`
   *   - available
   * - `type: 'select' | 'checkboxes' | 'radio'`
   *   - not available
   * @example '>='
   * @example 'starts with'
   * @example '€'
   */
  prefix?: string | Label
  /**
   * some text shown trailing behind the `<input>` field.
   * - `type: 'text' | 'date' | 'number'`
   *   - available
   * - `type: 'select' | 'checkboxes' | 'radio'`
   *   - not available
   * @example 'kg'
   * @example 'JPY'
   */
  suffix?: string | Label
  /**
   * Applied to the `<fieldset />` element
   * @example 'flex-column'
   */
  class?: string
  /**
   * Applied to the `<fieldset />` element
   * @example 'display: flex; flex-direction: column;'
   */
  style?: string
  /**
   * A Placeholder available for some filter types:
   * - `type: 'text' | 'date' | 'number'`
   *   - Text placeholder which will be displayed inside the <input /> field.
   * - `type: 'select'`
   *   - Text placeholder which will be displayed inside the `<select />` field.
   * - `type: 'checkboxes' | 'radio'`
   *   - not available
   * @example 'search...'
   * @example 'select...'
   */
  placeholder?: Label
  /**
   * An initial value that will be passed to the `<input />` field.
   * - `type: 'text' | 'date' | 'number'`
   *   - available
   * - `type: 'select' | 'checkboxes' | 'radio'`
   *   - not available
   */
  initialValue?: string | undefined
}

export type MUIRows<T extends Record<string, any>> = T[]

/**
 * - used for filters with `type: 'checkboxes'`.
 * - this value is used to apply which of the checkboxes are checked.
 */
export type FilterStateCheckboxes = { or: Set<WhereClause> }
/**
 * - used for filters with `type: 'select' | 'radio'`.
 * - this value is used to apply which of the radio/select options are checked.
 */
export type FilterStateOption = WhereClause
/**
 * - used for filters with `type: 'text' | 'date' | 'number'`.
 * - this value will be converted to whatever you defined as the `where` clause of the filter.
 */
export type FilterStateInputValue = string
/**
 * ### FilterStateCheckboxes
 * - used for filters with `type: 'checkboxes'`.
 * - this value is used to apply which of the checkboxes are checked.
 *
 * ### FilterStateOption
 * - used for filters with `type: 'select' | 'radio'`.
 * - this value is used to apply which of the radio/select options are checked.
 *
 * ### FilterStateInputValue
 * - used for filters with `type: 'text' | 'date' | 'number'`.
 * - this value will be converted to whatever you defined as the `where` clause of the filter.
 */
export type FilterState = FilterStateCheckboxes | FilterStateOption | FilterStateInputValue

/**
 * A map of the filter index with the where clauses to be applied.
 * @see {@link FilterState} for more info.
 */
export type FiltersState = Map<number, FilterState | undefined>

export function usesFilterStateInputValue(
  filter: MUIFilter<any>,
  state?: FilterState
): state is FilterStateInputValue | undefined {
  return filter.type === 'text' || filter.type === 'number' || filter.type === 'date'
}

export function usesFilterStateCheckboxes(
  filter: MUIFilter<any>,
  state?: FilterState
): state is FilterStateCheckboxes | undefined {
  return filter.type === 'checkboxes'
}

export function usesFilterStateOption(
  filter: MUIFilter<any>,
  state?: FilterState
): state is FilterStateOption | undefined {
  return filter.type === 'select' || filter.type === 'radio'
}

/**
 * This map is order-sensitive. `orderBy(...)` is applied in the insert order of this map
 */
export type OrderByState = Map<OPaths<any>, 'asc' | 'desc'>
export type EntryOfOrderByState = [OPaths<any>, 'asc' | 'desc']

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
  | 'magnetar table previous-next previous button'
  | 'magnetar table previous-next next button'
  | 'magnetar table previous-next end'

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
  'magnetar table previous-next previous button': 'Previous',
  'magnetar table previous-next next button': 'Next',
  'magnetar table previous-next end': 'Fetched Everything!',
}
