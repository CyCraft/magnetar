import type {
  DoOnFetchAggregate,
  FetchAggregateResponse,
  PathWhereIdentifier,
  PluginFetchSumAverageAction,
  PluginFetchSumAverageActionPayload,
} from '@magnetarjs/types'
import { getPathWhereIdentifier } from '@magnetarjs/types'
import { merge } from 'merge-anything'
import { nestifyObject } from 'nestify-anything'
import { Vue3StoreModuleConfig, Vue3StoreOptions } from '../CreatePlugin.js'

export function fetchSumAverageActionFactory(
  pathAggregateDic: {
    [collectionPath in PathWhereIdentifier]?: {
      [key in string]: number | { [key in string]: unknown }
    }
  },
  vue3StoreOptions: Vue3StoreOptions,
): PluginFetchSumAverageAction {
  return function ({
    payload,
    collectionPath,
    actionConfig,
    pluginModuleConfig,
  }: PluginFetchSumAverageActionPayload<Vue3StoreModuleConfig>):
    | FetchAggregateResponse
    | DoOnFetchAggregate {
    const pathId = getPathWhereIdentifier(collectionPath, pluginModuleConfig)

    const doOnFetchSumAggregate: DoOnFetchAggregate = (count) => {
      // abort updating local state if the payload was set to undefined
      if (count === undefined) return

      pathAggregateDic[pathId] = merge(
        pathAggregateDic[pathId],
        nestifyObject({ [payload]: count }),
      ) as any
    }
    return doOnFetchSumAggregate
  }
}
