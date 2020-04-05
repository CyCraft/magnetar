import pathToProp from 'path-to-prop'
import { PlainObject } from '../../src/types/base'
import { ActionNameWrite, VueSyncError } from '../../src/types/actions'
import { VueSyncPluginModuleConfig, isModuleCollection } from './pluginMock'
import {
  PluginWriteAction,
  PluginDeleteAction,
  PluginStreamAction,
  MustExecuteOnRead,
  StreamResponse,
  DoOnRead,
  PluginGetAction,
  MustExecuteOnGet,
} from '../../src/types/plugins'
import { merge } from 'merge-anything'
import { isArray, isString } from 'is-what'
import { waitMs } from './wait'
import { bulbasaur, flareon, charmander } from './pokemon'

export function writeActionFactory (
  moduleData: PlainObject,
  actionName: ActionNameWrite,
  storeName: string
): PluginWriteAction {
  return async function (
    payload: PlainObject | PlainObject[],
    pluginModuleConfig: VueSyncPluginModuleConfig
  ): Promise<PlainObject | PlainObject[]> {
    // this mocks an error during execution
    const shouldFailProp = isArray(payload) ? payload[0].shouldFail : payload.shouldFail
    const shouldFail = shouldFailProp === storeName
    if (shouldFail) {
      const errorToThrow: VueSyncError = {
        payload,
        message: 'fail',
      }
      throw errorToThrow
    }
    // this is custom logic to be implemented by the plugin author
    await waitMs(1)
    // this mocks an error during execution
    return payload
  }
}

export function deleteActionFactory (
  moduleData: PlainObject,
  storeName: string
): PluginDeleteAction {
  return async function (
    payload: PlainObject | PlainObject[] | string | string[],
    pluginModuleConfig: VueSyncPluginModuleConfig
  ): Promise<void> {
    const payloadArray = isArray(payload) ? payload : [payload]
    // this mocks an error during execution
    const shouldFailProp = isString(payloadArray[0]) ? payloadArray[0] : payloadArray[0].shouldFail
    const shouldFail = shouldFailProp === storeName
    if (shouldFail) {
      const errorToThrow: VueSyncError = {
        payload,
        message: 'fail',
      }
      throw errorToThrow
    }
    // this is custom logic to be implemented by the plugin author
    await waitMs(1)
    // this mocks an error during execution
  }
}

export function getActionFactory (
  moduleData: PlainObject,
  storeName: string,
  makeDataSnapshot: any
): PluginGetAction {
  return async (
    payload: void | PlainObject = {},
    pluginModuleConfig: VueSyncPluginModuleConfig,
    mustExecuteOnGet: MustExecuteOnGet
  ): Promise<void | PlainObject | PlainObject[]> => {
    // this is custom logic to be implemented by the plugin author
    makeDataSnapshot()
    const { path } = pluginModuleConfig
    const isCollection = isModuleCollection(pluginModuleConfig)
    const isDocument = !isCollection

    // this mocks an error during execution
    if (payload && payload.shouldFail === storeName) {
      const errorToThrow: VueSyncError = {
        payload,
        message: 'fail',
      }
      throw errorToThrow
    }
    // fetch from cache/or from a remote store with logic you implement here
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // this mocks an error during execution
        const dataRetrieved: PlainObject[] = isCollection
          ? [bulbasaur, flareon]
          : [{ name: 'Luca', age: 10, dream: 'job' }]
        // we must trigger `mustExecuteOnGet.added` for each document that was retrieved and return whatever that returns
        const results = dataRetrieved.map(_data => {
          const _metaData = {}
          return mustExecuteOnGet.added(_data, _metaData)
        })
        const resultToReturn = isCollection ? results : results[0]
        resolve(resultToReturn)
      }, 1)
    })
  }
}

export function streamActionFactory (
  moduleData: PlainObject,
  storeName: string
): PluginStreamAction {
  return (
    payload: void | PlainObject = {},
    pluginModuleConfig: VueSyncPluginModuleConfig,
    mustExecuteOnRead: MustExecuteOnRead
  ): StreamResponse | DoOnRead | Promise<StreamResponse | DoOnRead> => {
    // this is custom logic to be implemented by the plugin author
    const isCollection = isModuleCollection(pluginModuleConfig)
    const isDocument = !isCollection
    // we'll mock opening a stream

    const dataRetrieved = isCollection
      ? [bulbasaur, flareon, charmander]
      : [
          { name: 'Luca', age: 10 },
          { name: 'Luca', age: 10, dream: 'job' },
          { name: 'Luca', age: 10, dream: 'job', colour: 'blue' },
        ]
    const stopStreaming = {
      stopped: false,
      stop: () => {},
    }
    // this mocks actual data coming in at different intervals
    dataRetrieved.forEach((data, i) => {
      const waitTime = 10 + i * 500
      setTimeout(() => {
        // mock when the stream is already stopped
        if (stopStreaming.stopped) return
        // else go ahead and actually trigger the mustExecuteOnRead function
        const metaData = {}
        mustExecuteOnRead.added(data, metaData)
      }, waitTime)
    })

    // this mocks the opening of the stream
    const streaming: Promise<void> = new Promise((resolve, reject): void => {
      stopStreaming.stop = resolve
      setTimeout(() => {
        // this mocks an error during execution
        if (payload && payload.shouldFail === storeName) {
          const errorToThrow: VueSyncError = {
            payload,
            message: 'fail',
          }
          reject(errorToThrow)
        }
      }, 1)
    })
    function stop (): void {
      stopStreaming.stopped = true
      stopStreaming.stop()
    }
    return { streaming, stop }
  }
}
