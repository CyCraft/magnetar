import { OPathsWithOptional, WhereClauseTuple, WhereFilterOp } from '@magnetarjs/types'

export type OPaths<T> = OPathsWithOptional<T>

export type MUIItem<T extends Record<string, any>> = T

export type MUIColumn<T extends Record<string, any>> = MUIColumnData<T> | MUIColumnHandler<T>

export type MUIColumnHandler<T extends Record<string, any>> = {
  /** defaults to an empty string */
  label?: string
  /** Parses the value to be shown */
  button: {
    label: string | ((info: { data: T }) => any)
    handler: (info: { data: T }) => void
  }
  /** not available on a handler column */
  fieldPath?: undefined
  /** not available on a handler column */
  parseValue?: undefined
  /** not available on a handler column */
  sortable?: undefined
}

export type MUIColumnData<T extends Record<string, any>> = {
  /**
   * - Defaults to whatever you passed in `fieldPath`.
   * - Pass an empty string if you want to show nothing.
   */
  label?: string
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
  Path extends OPaths<T> = OPaths<T>,
  WhereOp extends WhereFilterOp = WhereFilterOp
> = MUIFilterOptions<T, Path, WhereOp> | MUIFilterOther

/**
 * TODO: not yet implemented!!
 */
export type MUIFilterOther = {
  label: string
  /**
   * TODO: not yet implemented!!
   */
  type: 'text' | 'date' | 'dateRange' | 'number'
  /** not available */
  options?: undefined
}

export type MUIFilterOptions<
  T extends Record<string, any>,
  Path extends OPaths<T> = OPaths<T>,
  WhereOp extends WhereFilterOp = WhereFilterOp
> = {
  label: string
  type: 'select' | 'checkboxes' | 'radio'
  options: {
    label: string
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
