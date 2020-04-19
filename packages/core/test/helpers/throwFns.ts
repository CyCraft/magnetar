import { PlainObject, VueSyncError } from '../../src/index'
import { isArray, isString } from 'is-what'
import { StorePluginOptions } from './pluginMockLocal'

export function throwIfEmulatedError (
  payload: PlainObject | PlainObject[] | string | string[] | void,
  storePluginOptions: StorePluginOptions
): void {
  if (!payload) return
  if (isArray(payload) && !payload.length) return
  const [firstEl] = !isArray(payload) ? [payload] : payload
  const shouldFailProp = isString(firstEl) ? firstEl : firstEl.shouldFail
  if (shouldFailProp !== storePluginOptions.storeName) return
  const errorToThrow: VueSyncError = {
    payload,
    message: 'failed',
  }
  throw errorToThrow
}
