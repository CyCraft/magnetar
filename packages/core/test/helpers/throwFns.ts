import { PlainObject } from '../../src/types/base'
import { isArray, isString } from 'is-what'
import { VueSyncError } from '../../src/types/actions'

export function throwIfEmulatedError (
  payload: PlainObject | PlainObject[] | string | string[] | void,
  storeName: string
): void {
  if (!payload) return
  if (isArray(payload) && !payload.length) return
  const [firstEl] = !isArray(payload) ? [payload] : payload
  const shouldFailProp = isString(firstEl) ? firstEl : firstEl.shouldFail
  if (shouldFailProp !== storeName) return
  const errorToThrow: VueSyncError = {
    payload,
    message: 'failed',
  }
  throw errorToThrow
}
