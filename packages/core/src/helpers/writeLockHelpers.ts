import type { DocMetadata, WriteLock } from '@magnetarjs/types'
import { isPromise } from 'is-what'

/**
 * await if there's a WriteLock for the document
 */
export async function writeLockPromise(
  writeLockMap: Map<string, WriteLock>,
  docIdentifier: string
): Promise<void> {
  const writeLock = writeLockMap.get(docIdentifier)
  if (writeLock && isPromise(writeLock.promise)) {
    await writeLock.promise
  }
}

/**
 * await if there's a WriteLock for the document, and return the latest version of the doc after this
 */
export async function getDocAfterWritelock(params: {
  writeLockMap: Map<string, WriteLock>
  lastIncomingDocs: Map<string, { payload: Record<string, unknown> | undefined; meta: DocMetadata }>
  docIdentifier: string
  payload: Record<string, unknown> | undefined
  meta: DocMetadata
}): Promise<undefined | { payload: Record<string, unknown> | undefined; meta: DocMetadata }> {
  const { writeLockMap, lastIncomingDocs, docIdentifier, payload, meta } = params
  // add to lastIncoming map
  lastIncomingDocs.set(docIdentifier, { payload, meta })

  // check if there's a WriteLock for the document
  await writeLockPromise(writeLockMap, docIdentifier)

  // grab from lastIncoming map
  const lastIncoming = lastIncomingDocs.get(docIdentifier)
  if (!lastIncoming) {
    // do nothing if there is no more last incoming
    // Sometimes multiple added & modified calls can cause this
    return
  }

  // delete from lastIncoming map
  lastIncomingDocs.delete(docIdentifier)

  return lastIncoming
}
