import { plainObject } from './types'
import { VueSyncConfig } from '.'

type eventName =
  | 'beforeLocal'
  | 'localSuccess'
  | 'localError'
  | 'beforeRemote'
  | 'remoteSuccess'
  | 'remoteError'

type eventFn = (args: { payload: plainObject; abort: () => void; error?: any }) => void

interface ActionConfig {
  on?: { [key in eventName]?: eventFn } & {
    aborted?: (args: { at: eventName; payload: plainObject }) => void
  }
}

export interface VueSyncModuleInstance {
  insert: (payload: plainObject, actionConfig: ActionConfig) => void
}

export interface ModuleConfig {
  type: 'collection' | 'document'
  localStore?: { path: string }
  remoteStore?: { path: string }
}

export function CreateModuleWithContext (
  moduleConfig: ModuleConfig,
  vueSyncConfig: VueSyncConfig
): VueSyncModuleInstance {
  return {
    insert: async (payload: plainObject, actionConfig: ActionConfig): Promise<void> => {
      const { on = {} } = actionConfig
      const {
        beforeLocal,
        localSuccess,
        localError,
        // beforeRemote,
        // remoteSuccess,
        // remoteError,
        aborted,
      } = on
      // const eventEntries = Object.entries(on)
      // create abort mechanism
      let abortExecution = false
      function abort (): void {
        abortExecution = true
      }
      // start local store insert
      const localStoreInsert = vueSyncConfig?.localStore?.insert
      if (localStoreInsert) {
        // before hook
        if (beforeLocal) {
          beforeLocal({ payload, abort })
        }
        // abort?
        if (abortExecution) {
          if (aborted) aborted({ at: 'beforeLocal', payload })
          return
        }
        let localStoreInsertResult
        try {
          localStoreInsertResult = await localStoreInsert(payload)
        } catch (error) {
          // error hook
          if (localError) {
            localError({ payload, abort, error })
          }
          // abort?
          if (abortExecution) {
            if (aborted) aborted({ at: 'localError', payload })
            return
          }
        }
        console.log('localStoreInsertResult → ', localStoreInsertResult)
        // success hook
        if (localSuccess) {
          localSuccess({ payload, abort })
        }
        // abort?
        if (abortExecution) {
          if (aborted) aborted({ at: 'localSuccess', payload })
          return
        }
      }
    },
  }
}
