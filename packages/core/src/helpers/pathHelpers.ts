import { isOdd, isEven, countCharacter } from './countHelpers'

export function isDocModule (path: string): boolean {
  return isOdd(countCharacter(path, /\//g))
}

export function isCollectionModule (path: string): boolean {
  return isEven(countCharacter(path, /\//g))
}

type CollectionPath = string
type DocId = string | undefined

/**
 * Returns a tuple with `[CollectionPath, DocId]` if the `DocId` is `undefined` that means that the `modulePath` passed is a collection!
 *
 * @param {string} modulePath
 * @returns {[CollectionPath, DocId]} is [string, string | undefined]
 */
export function getCollectionPathDocIdEntry (modulePath: string): [CollectionPath, DocId] {
  if (isCollectionModule(modulePath)) return [modulePath, undefined]
  const collectionPath = modulePath.split('/').slice(0, -1).join('/') // prettier-ignore
  const docId = modulePath.split('/').slice(-1)[0]
  return [collectionPath, docId]
}
