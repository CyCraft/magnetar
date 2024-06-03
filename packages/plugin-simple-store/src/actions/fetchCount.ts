import type {
  DoOnFetchAggregate,
  FetchAggregateResponse,
  PathWhereIdentifier,
  PluginFetchCountAction,
  PluginFetchCountActionPayload,
} from '@magnetarjs/types'
import { getPathWhereIdentifier } from '@magnetarjs/types'
import { SimpleStoreModuleConfig, SimpleStoreOptions } from '../CreatePlugin.js'

export function fetchCountActionFactory(
  pathCountDic: { [collectionPath in PathWhereIdentifier]?: number },
  simpleStoreOptions: SimpleStoreOptions,
): PluginFetchCountAction {
  return function ({
    collectionPath,
    actionConfig,
    pluginModuleConfig,
  }: PluginFetchCountActionPayload<SimpleStoreModuleConfig>):
    | FetchAggregateResponse
    | DoOnFetchAggregate {
    const pathId = getPathWhereIdentifier(collectionPath, pluginModuleConfig)

    const doOnFetchAggregateAction: DoOnFetchAggregate = (count) => {
      // abort updating local cache state if the payload was set to undefined
      if (count === undefined) return

      pathCountDic[pathId] = count
    }
    return doOnFetchAggregateAction
  }
}
