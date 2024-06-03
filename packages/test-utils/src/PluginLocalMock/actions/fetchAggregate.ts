import type {
  DoOnFetchAggregate,
  FetchAggregateResponse,
  PathWhereIdentifier,
  PluginFetchAggregateAction,
  PluginFetchAggregateActionPayload,
} from '@magnetarjs/types'
import { getPathWhereIdentifier } from '@magnetarjs/types'
import { merge } from 'merge-anything'
import { nestifyObject } from 'nestify-anything'
import { StorePluginModuleConfig, StorePluginOptions } from '../CreatePlugin.js'

export function fetchAggregateActionFactory(
  pathAggregateDic: {
    [collectionPath in PathWhereIdentifier]?: {
      [key in string]: number | { [key in string]: unknown }
    }
  },
  storePluginOptions: StorePluginOptions,
): PluginFetchAggregateAction {
  return function ({
    payload,
    collectionPath,
    actionConfig,
    pluginModuleConfig,
  }: PluginFetchAggregateActionPayload<StorePluginModuleConfig>):
    | FetchAggregateResponse
    | DoOnFetchAggregate {
    const pathId = getPathWhereIdentifier(collectionPath, pluginModuleConfig)

    const doOnFetchSumAggregate: DoOnFetchAggregate = (count) => {
      // abort updating local cache state if the payload was set to undefined
      if (count === undefined) return

      pathAggregateDic[pathId] = merge(
        pathAggregateDic[pathId],
        nestifyObject({ [payload]: count }),
      ) as any
    }
    return doOnFetchSumAggregate
  }
}
