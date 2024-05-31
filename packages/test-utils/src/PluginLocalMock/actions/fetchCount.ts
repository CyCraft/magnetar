import type {
  DoOnFetchCount,
  FetchCountResponse,
  PathWhereIdentifier,
  PluginFetchCountAction,
  PluginFetchCountActionPayload,
} from '@magnetarjs/types'
import { getPathWhereIdentifier } from '@magnetarjs/types'
import { StorePluginModuleConfig, StorePluginOptions } from '../CreatePlugin.js'

export function fetchCountActionFactory(
  pathCountDic: { [collectionPath in PathWhereIdentifier]?: number },
  storePluginOptions: StorePluginOptions
): PluginFetchCountAction {
  return function ({
    actionConfig,
    collectionPath,
    pluginModuleConfig,
  }: PluginFetchCountActionPayload<StorePluginModuleConfig>): FetchCountResponse | DoOnFetchCount {
    // this mocks an error during execution
    // throwIfEmulatedError(payload, storePluginOptions)
    // this is custom logic to be implemented by the plugin author
    const pathId = getPathWhereIdentifier(collectionPath, pluginModuleConfig)

    const doOnFetchCountAction: DoOnFetchCount = ({ count }) => {
      // abort updating local state if the payload was set to undefined
      if (count === undefined) return

      pathCountDic[pathId] = count
    }
    return doOnFetchCountAction
  }
}
