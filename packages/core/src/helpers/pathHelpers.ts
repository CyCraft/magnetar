import { isCollectionModule } from '@magnetarjs/utils'
import type { WriteLock } from '@magnetarjs/types'

/**
 * Returns a tuple with `[CollectionPath, DocId]` if the `DocId` is `undefined` that means that the `modulePath` passed is a collection!
 */
export function getCollectionPathDocIdEntry(
  modulePath: string
): [CollectionPath: string, DocId: string | undefined] {
  if (isCollectionModule(modulePath)) return [modulePath, undefined]
  const collectionPath = modulePath.split('/').slice(0, -1).join('/') // prettier-ignore
  const docId = modulePath.split('/').slice(-1)[0]
  return [collectionPath, docId]
}

/**
 * Gets all WriteLock objects of a certain `collectionPath` from the `WriteLockMap`
 */
export function getCollectionWriteLocks(
  collectionPath: string,
  writeLockMap: Map<string, WriteLock>
): WriteLock[] {
  return [...writeLockMap.entries()]
    .filter(([modulePath]) => {
      const [_collectionPath] = getCollectionPathDocIdEntry(modulePath)
      return _collectionPath === collectionPath
    })
    .map(([modulePath, writeLock]) => writeLock)
}
