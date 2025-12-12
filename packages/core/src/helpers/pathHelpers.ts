import { isCollectionModule } from '@magnetarjs/utils'

/**
 * Returns a tuple with `[CollectionPath, DocId]` if the `DocId` is `undefined` that means that the `modulePath` passed is a collection!
 */
export function getCollectionPathDocIdEntry(
  modulePath: string,
): [CollectionPath: string, DocId: string | undefined] {
  if (isCollectionModule(modulePath)) return [modulePath, undefined]
  const collectionPath = modulePath.split('/').slice(0, -1).join('/') // prettier-ignore
  const docId = modulePath.split('/').slice(-1)[0]
  return [collectionPath, docId]
}
