import { isArray, isPlainObject } from 'is-what'

export function throwIfEmulatedError(
  payload:
    | { [key: string]: unknown }
    | { [key: string]: unknown }[]
    | string
    | string[]
    | undefined,
  storePluginOptions: { storeName: string } & { [key in string]: any }
): undefined {
  const { storeName } = storePluginOptions
  if (!payload) return
  if (isArray(payload) && !payload.length) return
  const payloadArray = !isArray(payload) ? [payload] : payload
  const shouldFail = payloadArray.some(
    (p) => p === storeName || (isPlainObject(p) && p['shouldFail'] === storeName)
  )
  if (!shouldFail) return
  const errorToThrow = {
    payload,
    message: 'failed',
  }
  throw errorToThrow
}
