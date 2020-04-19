import { isString } from 'is-what'
import {
  isCollectionModule,
  PlainObject,
  PluginStreamAction,
  StreamResponse,
  DoOnStream,
  MustExecuteOnRead,
} from '@vue-sync/core'
import { StorePluginModuleConfig, SimpleStoreConfig } from '..'
import { insertActionFactory } from './insert'
import { deleteActionFactory } from './delete'

export function streamActionFactory (
  moduleData: PlainObject,
  simpleStoreConfig: SimpleStoreConfig,
  makeDataSnapshot: any
): PluginStreamAction {
  return (
    payload: void | PlainObject = {},
    modulePath: string,
    pluginModuleConfig: StorePluginModuleConfig,
    mustExecuteOnRead: MustExecuteOnRead
  ): StreamResponse | DoOnStream | Promise<StreamResponse | DoOnStream> => {
    // hover over the prop names below to see more info on when they are triggered:
    const doOnStream: DoOnStream = {
      added: (payload, meta) => {
        insertActionFactory(moduleData, simpleStoreConfig)(payload, modulePath, pluginModuleConfig) // prettier-ignore
      },
      modified: (payload, meta) => {
        insertActionFactory(moduleData, simpleStoreConfig)(payload, modulePath, pluginModuleConfig) // prettier-ignore
      },
      removed: (payload, meta) => {
        const isCollection = isCollectionModule(modulePath)
        const pathToDelete = !isCollection
          ? modulePath
          : isString(payload)
          ? `${modulePath}/${payload}`
          : `${modulePath}/${meta.id}`
        deleteActionFactory(moduleData, simpleStoreConfig)(
          undefined,
          pathToDelete,
          pluginModuleConfig
        )
      },
    }
    return doOnStream
  }
}
