import { StreamResponse, DoOnStreamFns } from '../types/plugins'
import { isFullString } from 'is-what'
import { isDocModule, isCollectionModule } from './pathHelpers'

export function logError (errorMessage: string): void {
  console.error('[@vue-sync error]\n', errorMessage)
}

export function logErrorAndThrow (errorMessage: string): void {
  logError(errorMessage)
  throw new Error(errorMessage)
}

export function throwOnIncompleteStreamResponses (
  streamInfoPerStore: { [storeName: string]: StreamResponse },
  doOnStreamFns: DoOnStreamFns
): void {
  const noStreamLogic = !Object.keys(streamInfoPerStore).length
  if (noStreamLogic) {
    const errorMessage = 'None of your store plugins have implemented logic to open a stream.'
    logErrorAndThrow(errorMessage)
  }
  const noDoOnStreamLogic = !Object.values(doOnStreamFns).flat().length
  if (noDoOnStreamLogic) {
    const errorMessage =
      'None of your store plugins have implemented logic to do something with the data coming in from streams.'
    logErrorAndThrow(errorMessage)
  }
}

export function throwIfNoFnsToExecute (storesToExecute: string[]): void {
  if (storesToExecute.length === 0) {
    const errorMessage =
      'None of your store plugins have implemented this function or you have not defined an executionOrder anywhere.'
    logErrorAndThrow(errorMessage)
  }
}

export function throwIfNoDataStoreName (dataStoreName: string): void {
  if (isFullString(dataStoreName)) return
  const errorMessage = `No 'dataStoreName' provided.`
  logErrorAndThrow(errorMessage)
}

export function throwIfInvalidModulePath (
  modulePath: string,
  moduleType: 'collection' | 'doc'
): void {
  let errorMessage = ''
  if (moduleType === 'collection') {
    if (!modulePath)
      errorMessage =
        'You must provide a collection id (or a "path" like so: collection/doc/collection).'
    if (isDocModule(modulePath))
      errorMessage = `Your collection id (or "path") must be of odd segments. The expected pattern is: collection/doc/collection ... Yours was ${modulePath}`
  }
  if (moduleType === 'doc') {
    if (!modulePath)
      errorMessage = 'You must provide a document id (or a "path" like so: collection/doc).'
    if (isCollectionModule(modulePath))
      errorMessage = `Your doc id (or "path") must be of even segments. The expected pattern is: collection/doc/collection/doc ... Yours was ${modulePath}`
  }
  if (errorMessage) logErrorAndThrow(errorMessage)
}
