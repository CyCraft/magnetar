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
    // this is custom logic to be implemented by the plugin author
    // this mocks how the result from the next store (the remote store) should update this local store per action type
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
          : `${modulePath}/${payload.id}`
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
