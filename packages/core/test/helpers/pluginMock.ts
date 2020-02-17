import { ActionName, VueSyncAction, VueSyncError } from '../../src/types/actions'
import { PluginInstance } from '../../src/types/base'
import { PlainObject } from '../../types/types/actions'

interface PluginConfig {
  storeName: string
}
type VueSyncActions = {
  [action in ActionName]?: VueSyncAction
}

function createGenericAction (storeName): VueSyncAction {
  return async <T extends PlainObject>(payload: T): Promise<Partial<T>> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (payload.shouldFail === storeName) {
          const errorToThrow: VueSyncError = {
            payload,
            message: 'fail',
          }
          reject(errorToThrow)
        } else {
          resolve(payload)
        }
      }, 10)
    })
  }
}

function createRevertAction (storeName) {
  return function<T extends PlainObject> (payload: T, actionName: ActionName): Promise<T> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (payload.shouldFailOnRevert === storeName) {
          const errorToThrow: VueSyncError = {
            payload,
            message: 'revert failed',
          }
          reject(errorToThrow)
        } else {
          resolve({ ...payload, reverted: { actionName, storeName } })
        }
      }, 10)
    })
  }
}

export const VueSyncGenericPlugin = (config: PluginConfig): PluginInstance => {
  const { storeName } = config
  const get = createGenericAction(storeName)
  const stream = createGenericAction(storeName)
  const insert = createGenericAction(storeName)
  const merge = createGenericAction(storeName)
  const assign = createGenericAction(storeName)
  const revert = createRevertAction(storeName)
  return {
    config,
    revert,
    actions: {
      get,
      stream,
      insert,
      merge,
      assign,
    },
  }
}
