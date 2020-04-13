import { PlainObject, VueSyncError } from '@vue-sync/core'
import { isArray, isString } from 'is-what'
import { StorePluginConfig } from './pluginMockRemote'

export function throwIfEmulatedError (
  payload: PlainObject | PlainObject[] | string | string[] | void,
  storePluginConfig: StorePluginConfig
): void {
  if (!payload) return
  if (isArray(payload) && !payload.length) return
  const [firstEl] = !isArray(payload) ? [payload] : payload
  const shouldFailProp = isString(firstEl) ? firstEl : firstEl.shouldFail
  if (shouldFailProp !== storePluginConfig.storeName) return
  const errorToThrow: VueSyncError = {
    payload,
    message: 'failed',
  }
  throw errorToThrow
}
