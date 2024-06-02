import type {
  DoOnFetch,
  DoOnFetchAggregate,
  DoOnStream,
  FetchAggregateResponse,
  FetchResponse,
} from '@magnetarjs/types'
import { isArray, isFunction, isNumber, isPlainObject } from 'is-what'

/**
 * DoOnStream type guard
 */
export function isDoOnStream(payload: any): payload is DoOnStream {
  const isNotDoOnStream =
    !isPlainObject(payload) ||
    payload['streaming'] ||
    payload['stop'] ||
    !(payload['added'] || payload['modified'] || payload['removed'])
  return !isNotDoOnStream
}

// 'fetch' related

/**
 * DoOnFetch type guard
 */
export function isDoOnFetchAggregate(payload: any): payload is DoOnFetchAggregate {
  return isFunction(payload)
}

/**
 * FetchResponse type guard
 */
export function isFetchAggregateResponse(payload: any): payload is FetchAggregateResponse {
  return isPlainObject(payload) && isNumber(payload['count'])
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
  return isPlainObject(payload) && isArray(payload['docs'])
}
