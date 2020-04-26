import { isString } from 'is-what'
import {
  isCollectionModule,
  PlainObject,
  PluginStreamAction,
  StreamResponse,
  DoOnStream,
  MustExecuteOnRead,
} from '@vue-sync/core'
import { SimpleStoreModuleConfig, SimpleStoreOptions } from '../CreatePlugin'
import { insertActionFactory } from './insert'
import { deleteActionFactory } from './delete'

export function streamActionFactory (
  data: { [collectionPath: string]: Map<string, PlainObject> },
  simpleStoreOptions: SimpleStoreOptions
): PluginStreamAction {
  return (
    payload: void | PlainObject = {},
    [collectionPath, docId]: [string, string | undefined],
    simpleStoreModuleConfig: SimpleStoreModuleConfig,
    mustExecuteOnRead: MustExecuteOnRead
  ): StreamResponse | DoOnStream | Promise<StreamResponse | DoOnStream> => {
    // hover over the prop names below to see more info on when they are triggered:
    const doOnStream: DoOnStream = {
      added: (payload, meta) => {
        insertActionFactory(data, simpleStoreOptions)(
          payload,
          [collectionPath, docId],
          simpleStoreModuleConfig
        )
      },
      modified: (payload, meta) => {
        insertActionFactory(data, simpleStoreOptions)(
          payload,
          [collectionPath, docId],
          simpleStoreModuleConfig
        )
      },
      removed: (payload, meta) => {
        const pathToDelete: [string, string] = docId
          ? [collectionPath, docId]
          : isString(payload)
          ? [collectionPath, payload]
          : [collectionPath, meta.id]
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
