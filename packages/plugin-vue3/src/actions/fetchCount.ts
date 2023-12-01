import type {
  DoOnFetchCount,
  FetchCountResponse,
  PathWhereIdentifier,
  PluginFetchCountAction,
  PluginFetchCountActionPayload,
} from '@magnetarjs/types'
import { getPathWhereIdentifier } from '@magnetarjs/types'
import { Vue3StoreModuleConfig, Vue3StoreOptions } from '../CreatePlugin'

export function fetchCountActionFactory(
  pathCountDic: { [collectionPath in PathWhereIdentifier]?: number },
  Vue3StoreOptions: Vue3StoreOptions
): PluginFetchCountAction {
  return function ({
    collectionPath,
    actionConfig,
    pluginModuleConfig,
  }: PluginFetchCountActionPayload<Vue3StoreModuleConfig>): FetchCountResponse | DoOnFetchCount {
    const pathId = getPathWhereIdentifier(collectionPath, pluginModuleConfig)

    const doOnFetchCountAction: DoOnFetchCount = ({ count }) => {
      // abort updating local state if the payload was set to undefined
      if (count === undefined) return

      pathCountDic[pathId] = count
    }
    return doOnFetchCountAction
  }
}
