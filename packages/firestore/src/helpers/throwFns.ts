import { isFullString } from 'is-what'
import { isDocModule, isCollectionModule } from '@vue-sync/core'

export function logError (errorMessage: string): void {
  console.error('[@vue-sync/firestore error]\n', errorMessage)
}

export function logErrorAndThrow (errorMessage: string): void {
  logError(errorMessage)
  throw new Error(errorMessage)
}

export function throwIfInvalidFirestorePath (
  firestorePath: string,
  moduleType?: 'collection' | 'doc'
): void {
  let errorMessage = ''
  // no firestorePath found
  if (!isFullString(firestorePath)) {
    errorMessage = `Firestore "path" not found.
    You can enable \`useModulePathsForFirestore\` in the Firestore plugin options to automatically use the same paths in Firestore as your modules.
    Otherwise you have to set the firestorePath on your doc/collection like so: \`doc('myCollection/myDoc', { configPerStore: { [storePluginName]: { firestorePath: 'myFirestorePath/someDoc' } } })\``
  }
  // sanity check for collections
  else if (moduleType === 'collection') {
    if (isDocModule(firestorePath))
      errorMessage = `Your collection id (or "path") must be of odd segments. The expected pattern is: collection/doc/collection ... Yours was ${firestorePath}`
  }
  // sanity check for docs
  else if (moduleType === 'doc') {
    if (isCollectionModule(firestorePath))
      errorMessage = `Your doc id (or "path") must be of even segments. The expected pattern is: collection/doc/collection/doc ... Yours was ${firestorePath}`
  }
  if (errorMessage) logErrorAndThrow(errorMessage)
}
