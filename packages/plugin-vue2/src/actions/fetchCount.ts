import {
  PluginFetchCountAction,
  FetchCountResponse,
  DoOnFetchCount,
  PluginFetchCountActionPayload,
  PathWhereIdentifier,
  getPathWhereIdentifier,
} from '@magnetarjs/types'
import { Vue2StoreModuleConfig, Vue2StoreOptions } from '../CreatePlugin'

export function fetchCountActionFactory(
  pathCountDic: { [collectionPath in PathWhereIdentifier]?: number },
  vue2StoreOptions: Vue2StoreOptions
): PluginFetchCountAction {
  return function ({
    collectionPath,
    actionConfig,
    pluginModuleConfig,
  }: PluginFetchCountActionPayload<Vue2StoreModuleConfig>): FetchCountResponse | DoOnFetchCount {
    const pathId = getPathWhereIdentifier(collectionPath, pluginModuleConfig)

    const doOnFetchCountAction: DoOnFetchCount = ({ count }) => {
      // abort updating local state if the payload was set to undefined
      if (count === undefined) return

      pathCountDic[pathId] = count
    }
    return doOnFetchCountAction
  }
}
