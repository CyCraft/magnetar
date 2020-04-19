import { PlainObject, VueSyncError } from '@vue-sync/core'
import { isArray, isString, isPlainObject } from 'is-what'
import { StorePluginConfig } from './pluginMockRemote'

export function throwIfEmulatedError (
  payload: PlainObject | PlainObject[] | string | string[] | void,
  storePluginConfig: StorePluginConfig
): void {
  const { storeName } = storePluginConfig
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
