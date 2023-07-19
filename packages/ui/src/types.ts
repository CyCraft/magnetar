import { OPathsWithOptional, WhereClauseTuple, WhereFilterOp } from '@magnetarjs/types'

export type OPaths<T> = OPathsWithOptional<T>

/** You can pass a text parser which will be used for any `label` used throughout the table */
export type MUIParseLabel<LabelType = any> = (label: LabelType) => string

export type MUIColumn<T extends Record<string, any>, Label extends string = string> =
  | MUIColumnData<T, Label>
  | MUIColumnHandler<T, Label>

export type MUIColumnHandler<T extends Record<string, any>, Label extends string = string> = {
  /** defaults to an empty string */
  label?: Label
  /** Parses the value to be shown */
  button: {
    label: Label | ((info: { data: T }) => Label)
    handler: (info: { data: T }) => void
  }
  /** not available on a handler column */
  fieldPath?: undefined
  /** not available on a handler column */
  parseValue?: undefined
  /** not available on a handler column */
  sortable?: undefined
}

export type MUIColumnData<T extends Record<string, any>, Label extends string = string> = {
  /**
   * - Defaults to whatever you passed in `fieldPath`.
   * - Pass an empty string if you want to show nothing.
   */
  label?: Label
  /**
   * Represents the path to the prop that should be shown in this column for each data item.
   * @example 'name' // would show `data.name`
   * @example 'name.family' // would show `data.name.family`
   *
   * If the value doesn't matter for a column, because you want to show a combination of 2 columns with the `parseValue` function, you can just default to `'id'`.
   */
  fieldPath: OPaths<T>
  /**
   * Parses the value to be shown
   * @example ({ value }) => value > 10 ? 'lg' : 'sm'
   * @example ({ value }) => !!value ? '✅' : '❌'
   * @example ({ data }) => data.name.family + ' ' + data.name.given
   */
  parseValue?: (info: { value: any; data: T }) => any
  /**
   * A simple prefix that will be shown as part of the cell value
   * @example '¥'
   */
  prefix?: string
  /**
   * A simple suffix that will be shown as part of the cell value
   * @example 'kg'
   */
  suffix?: string
  /** When `true` this column will become sortable as per the Magnetar orderBy feature */
  sortable?: boolean | { orderBy: 'asc' | 'desc'; position: number }
  /** not available on a data column */
  button?: undefined
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
  | 'magnetar table info fetch-state error default'
  | 'magnetar table info counts total'
  | 'magnetar table info counts filter'
  | 'magnetar table info counts showing'
  | 'magnetar table info fetch-state reset'
  | 'magnetar table info active filters'
  | 'magnetar table no-results'
  | 'magnetar table fetch-more button'

export const muiLabelDic = {
  'magnetar table info fetch-state error default': 'An error occured, check the console',
  'magnetar table info counts total': 'total',
  'magnetar table info counts filter': 'filter',
  'magnetar table info counts showing': 'showing',
  'magnetar table info fetch-state reset': 'reset to defaults',
  'magnetar table no-results': 'No results found',
  'magnetar table info active filters': 'Active Filters',
  'magnetar table fetch-more button': 'Fetch More',
}
