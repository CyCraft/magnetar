import type { DoOnStreamFns, StreamResponse } from '@magnetarjs/types'
import { isCollectionModule, isDocModule } from '@magnetarjs/utils'

export function logError(errorMessage: string): undefined {
  console.error('[@magnetarjs error]\n', errorMessage)
}

export function logErrorAndThrow(errorMessage: string): undefined {
  logError(errorMessage)
  throw new Error(errorMessage)
}

export function throwOnIncompleteStreamResponses(
  streamInfoPerStore: { [storeName: string]: StreamResponse },
  doOnStreamFns: DoOnStreamFns,
): undefined {
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

export function throwIfNoFnsToExecute(storesToExecute: string[]): undefined {
  if (storesToExecute.length === 0) {
    const errorMessage =
      'None of your store plugins have implemented this function or you have not defined an executionOrder anywhere.'
    logErrorAndThrow(errorMessage)
  }
}

export function throwIfInvalidModulePath(
  modulePath: string,
  moduleType: 'collection' | 'doc',
): undefined {
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
