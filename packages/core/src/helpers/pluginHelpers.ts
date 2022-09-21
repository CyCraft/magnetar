import { isPlainObject, isFunction, isArray } from 'is-what'
import { DoOnFetch, DoOnStream, FetchResponse } from '@magnetarjs/types'

/**
 * DoOnStream type guard
 */
export function isDoOnStream(payload: any): payload is DoOnStream {
  const isNotDoOnStream =
    !isPlainObject(payload) ||
    payload.streaming ||
    payload.stop ||
    !(payload.added || payload.modified || payload.removed)
  return !isNotDoOnStream
}

// 'fetch' related

/**
 * DoOnFetch type guard
 */
export function isDoOnFetch(payload: any): payload is DoOnFetch {
  return isFunction(payload)
}

/**
 * FetchResponse type guard
 */
export function isFetchResponse(payload: any): payload is FetchResponse {
  return isPlainObject(payload) && isArray(payload.docs)
}
