import { isAnyObject } from 'is-what'

export const storeSplitSymbol = Symbol('storeSplit')

/**
 * A storeSplit function allows you to apply a different payload between your cache store vs your other stores.
 *
 * It will let TypeScript know that you're trying to apply the type of whatever you pass to the `cache` key, even though your other stores might receive other values.
 *
 * ### Example Use Case
 * ```ts
 * import { storeSplit } from '@magnetarjs/utils'
 *
 * magnetar.collection('user').doc('1').merge({
 *   name: 'updated name',
 *   // ...
 *   dateUpdated: storeSplit({
 *     cache: new Date(),
 *     remote: serverTimestamp(),
 *   })
 * })
 * ```
 */
export function storeSplit<Payload extends { cache: any; [key: string]: any }>(
  payload: Payload,
): Payload['cache'] {
  return {
    storeSplitSymbol,
    storePayloadDic: payload,
  } as unknown as Payload['cache']
}

export function isStoreSplit(payload: unknown): payload is {
  storeSplitSymbol: symbol
  storePayloadDic: { cache: any; [key: string]: any }
} {
  return isAnyObject(payload) && payload['storeSplitSymbol'] === storeSplitSymbol
}
