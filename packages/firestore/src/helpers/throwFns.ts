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
  if (!moduleType) {
    // only check if the firestorePath is a full string or not
    if (!isFullString(firestorePath)) {
      errorMessage = `You must provide a firestorePath in your module's options. Eg. vueSync.collection('todos', { configPerStore: { firestore: { firestorePath: 'myTodos' }}})`
    }
  }
  if (moduleType === 'collection') {
    if (!firestorePath)
      errorMessage =
        'You must provide a collection id (or a "path" like so: collection/doc/collection).'
    if (isDocModule(firestorePath))
      errorMessage = `Your collection id (or "path") must be of odd segments. The expected pattern is: collection/doc/collection ... Yours was ${firestorePath}`
  }
  if (moduleType === 'doc') {
    if (!firestorePath)
      errorMessage = `Firestore document "path" not found.
You can enable \`useModulePathsForFirestore\` in the Firestore plugin options to automatically use the same paths in Firestore as your modules.
Otherwise you have to set the firestorePath like so: \`doc('myCollection/myDoc', { configPerStore: { storePluginName: { firestorePath: 'myFirestorePath/someDoc' } } })\``
    if (isCollectionModule(firestorePath))
      errorMessage = `Your doc id (or "path") must be of even segments. The expected pattern is: collection/doc/collection/doc ... Yours was ${firestorePath}`
  }
  if (errorMessage) logErrorAndThrow(errorMessage)
}
