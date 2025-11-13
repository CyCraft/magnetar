import type { DocMetadata } from '@magnetarjs/types'

/**
 * await if there's a WriteLock for the document, and return the latest version of the doc after this
 */
export function getDocAfterWritelock(params: {
  lastIncomingDocs: Map<
    string,
    { payload: { [key: string]: unknown } | undefined; meta: DocMetadata }
  >
  docIdentifier: string
}): undefined | { payload: { [key: string]: unknown } | undefined; meta: DocMetadata } {
  const { lastIncomingDocs, docIdentifier } = params
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
