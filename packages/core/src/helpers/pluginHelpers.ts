import { isPlainObject, isFunction, isArray, isNumber } from 'is-what'
import {
  DoOnFetch,
  DoOnFetchCount,
  DoOnStream,
  FetchCountResponse,
  FetchResponse,
} from '@magnetarjs/types'

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
export function isDoOnFetchCount(payload: any): payload is DoOnFetchCount {
  return isFunction(payload)
}

/**
 * FetchResponse type guard
 */
export function isFetchCountResponse(payload: any): payload is FetchCountResponse {
  return isPlainObject(payload) && isNumber(payload.count)
}

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
