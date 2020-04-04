import pathToProp from 'path-to-prop'
import { PlainObject } from '../../src/types/base'
import { ActionNameWrite, VueSyncError } from '../../src/types/actions'
import { VueSyncPluginModuleConfig, isModuleCollection } from './pluginMock'
import { PluginWriteAction } from '../../src/types/plugins'
import { merge } from 'merge-anything'

export function writeActionFactory (
  moduleData: PlainObject,
  actionName: ActionNameWrite,
  storeName: string
): PluginWriteAction {
  return function (
    payload: PlainObject,
    pluginModuleConfig: VueSyncPluginModuleConfig
  ): PlainObject {
    // this mocks an error during execution
    const shouldFail = payload.shouldFail === storeName
    if (shouldFail) {
      const errorToThrow: VueSyncError = {
        payload,
        message: 'fail',
      }
      throw errorToThrow
    }
    // this is custom logic to be implemented by the plugin author
    const { path } = pluginModuleConfig
    const isCollection = isModuleCollection(pluginModuleConfig)
    const isDocument = !isCollection
    const db = pathToProp(moduleData, path)

    if (actionName === 'insert') {
      const id = payload.id ?? String(Math.random())
      if (isCollection) {
        db[id] = payload
        return payload
      }
      if (isDocument) {
        throw new Error(
          `You can only 'insert' when the module is of "collection" type. Your passed "path" for this module points to a "document" type module.`
        )
      }
    }

    if (actionName === 'merge') {
      if (isCollection) {
        db[payload.id] = merge(db[payload.id], payload)
      }
      if (isDocument) {
        // this mocks data merged into a 'document'
        Object.entries(payload).forEach(([key, value]) => {
          db[key] = merge(db[key], value)
        })
      }
    }
    return
  }
}

export function a (): number {
  return
}
