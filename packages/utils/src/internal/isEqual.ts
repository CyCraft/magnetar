import { isArray, isDate, isPlainObject } from 'is-what'

/**
 * A simple equal check function that checks if two values are equal.
 * It will only double recursively go into arrays and plain objects.
 * For Dates it checks `getTime()`.
 *
 * Otherwise it does the `===` primitive check.
 */
export function isEqual(a: unknown, b: unknown): boolean {
  if (isDate(a) && isDate(b)) {
    return a.getTime() === b.getTime()
  }
  if (isArray(a) && isArray(b)) {
    return a.length === b.length && a.every((item, index) => isEqual(item, b[index]))
  }
  if (isPlainObject(a) && isPlainObject(b)) {
    const aKeys = Object.keys(a)
    const bKeys = Object.keys(b)
    return aKeys.length === bKeys.length && aKeys.every((key) => isEqual(a[key], b[key]))
  }
  return a === b
}
