import { isAnyObject, isFunction } from 'is-what'

/**
 * Parses a value found at the field path, in order to be able to make a better comparison.
 *
 * TODO: find a way for the plugins to be able to define this.
 */
export function parseValueForFilters(val: any): any {
  try {
    if (isAnyObject(val) && 'toDate' in val && isFunction(val['toDate'])) {
      return val['toDate']()
    }
  } catch (error: unknown) {
    return val
  }
  return val
}
