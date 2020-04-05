import { StreamResponse, DoOnReadFns } from '../types/plugins'
import { isFullString } from 'is-what'

export function logError (errorMessage: string): void {
  console.error('[vue-sync error]\n', errorMessage)
}

export function throwOnIncompleteStreamResponses (
  streamInfoPerStore: { [storeName: string]: StreamResponse },
  doOnReadFns: DoOnReadFns
): void {
  const noStreamLogic = !Object.keys(streamInfoPerStore).length
  if (noStreamLogic) {
    const errorMessage = 'None of your store plugins have implemented logic to open a stream.'
    logError(errorMessage)
    throw new Error(errorMessage)
  }
  const noDoOnReadLogic = !Object.values(doOnReadFns).flat().length
  if (noDoOnReadLogic) {
    const errorMessage =
      'None of your store plugins have implemented logic to do something with the data coming in from streams.'
    logError(errorMessage)
    throw new Error(errorMessage)
  }
}

export function throwIfNoFnsToExecute (storesToExecute: string[]): void {
  if (storesToExecute.length === 0) {
    const errorMessage =
      'None of your store plugins have implemented this function or you have not defined an executionOrder anywhere.'
    logError(errorMessage)
    throw new Error(errorMessage)
  }
}

export function throwIfNoDataStoreName (dataStoreName: string): void {
  if (isFullString(dataStoreName)) return
  const errorMessage = `No 'dataStoreName' provided.`
  logError(errorMessage)
  throw new Error(errorMessage)
}
