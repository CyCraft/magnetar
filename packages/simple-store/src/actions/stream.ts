import { isString } from 'is-what'
import {
  isCollectionModule,
  PlainObject,
  PluginStreamAction,
  StreamResponse,
  DoOnStream,
  MustExecuteOnRead,
} from '@vue-sync/core'
import { SimpleStoreModuleConfig, SimpleStoreOptions } from '..'
import { insertActionFactory } from './insert'
import { deleteActionFactory } from './delete'

export function streamActionFactory (
  data: { [collectionPath: string]: Map<string, PlainObject> },
  simpleStoreOptions: SimpleStoreOptions
): PluginStreamAction {
  return (
    payload: void | PlainObject = {},
    modulePath: string,
    simpleStoreModuleConfig: SimpleStoreModuleConfig,
    mustExecuteOnRead: MustExecuteOnRead
  ): StreamResponse | DoOnStream | Promise<StreamResponse | DoOnStream> => {
    // hover over the prop names below to see more info on when they are triggered:
    const doOnStream: DoOnStream = {
      added: (payload, meta) => {
        insertActionFactory(data, simpleStoreOptions)(payload, modulePath, simpleStoreModuleConfig)
      },
      modified: (payload, meta) => {
        insertActionFactory(data, simpleStoreOptions)(payload, modulePath, simpleStoreModuleConfig)
      },
      removed: (payload, meta) => {
        const isCollection = isCollectionModule(modulePath)
        const pathToDelete = !isCollection
          ? modulePath
          : isString(payload)
          ? `${modulePath}/${payload}`
          : `${modulePath}/${meta.id}`
        deleteActionFactory(data, simpleStoreOptions)(
          undefined,
          pathToDelete,
          simpleStoreModuleConfig
        )
      },
    }
    return doOnStream
  }
}
