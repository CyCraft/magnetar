import { isString } from 'is-what'
import {
  PlainObject,
  PluginStreamAction,
  StreamResponse,
  DoOnStream,
  MustExecuteOnRead,
} from '@vue-sync/core'
import { SimpleStoreModuleConfig, SimpleStoreOptions } from '../CreatePlugin'
import { insertActionFactory } from './insert'
import { deleteActionFactory } from './delete'
import { throwIfEmulatedError } from '../../throwFns'

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
    // this mocks an error during execution
    throwIfEmulatedError(payload, simpleStoreOptions)

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
        const collectionPathDocIdToDelete: [string, string] = docId
          ? [collectionPath, docId]
          : isString(payload)
          ? [collectionPath, payload]
          : [collectionPath, meta.id]
        deleteActionFactory(data, simpleStoreOptions)(
          undefined,
          collectionPathDocIdToDelete,
          simpleStoreModuleConfig
        )
      },
    }
    return doOnStream
  }
}
