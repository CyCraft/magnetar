import type {
  DocMetadata,
  DoOnFetch,
  OnAddedFn,
  OnModifiedFn,
  OnRemovedFn,
} from '@magnetarjs/types'

/**
 * Executes given function array with given args-array deconstructed, it will always use replace the first param with whatever the response of each function was.
 */
export function executeOnFns<Payload extends { [key: string]: any } | string | undefined>(params: {
  modifyReadResultFns: (OnAddedFn | OnModifiedFn | OnRemovedFn)[]
  cacheStoreFns: (DoOnFetch | OnAddedFn | OnModifiedFn | OnRemovedFn)[]
  payload: Payload
  docMetaData: DocMetadata
}): Payload | undefined {
  const { modifyReadResultFns, cacheStoreFns, payload, docMetaData } = params

  let newPayload = payload
  for (const fn of modifyReadResultFns) {
    // we only want to execute these when there is a payload
    if (newPayload) newPayload = fn(newPayload as any, docMetaData) as any
  }
  for (const fn of cacheStoreFns) {
    // we only want to execute these always, regardless wether or not there's a payload
    newPayload = fn(newPayload as any, docMetaData) as any
  }
  return newPayload
}
