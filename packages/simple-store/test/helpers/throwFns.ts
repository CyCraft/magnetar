import { PlainObject, VueSyncError } from '@vue-sync/core'
import { isArray, isPlainObject } from 'is-what'

export function throwIfEmulatedError (
  payload: PlainObject | PlainObject[] | string | string[] | void,
  storePluginOptions: any
): void {
  const { storeName } = storePluginOptions
  if (!payload) return
  if (isArray(payload) && !payload.length) return
  const payloadArray = !isArray(payload) ? [payload] : payload
  const shouldFail = payloadArray.some(
    p => p === storeName || (isPlainObject(p) && p.shouldFail === storeName)
  )
  if (!shouldFail) return
  const errorToThrow: VueSyncError = {
    payload,
    message: 'failed',
  }
  throw errorToThrow
}
