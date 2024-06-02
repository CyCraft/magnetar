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
import { SimpleStoreModuleConfig, SimpleStoreOptions } from '../CreatePlugin.js'

export function fetchAggregateActionFactory(
  pathAggregateDic: {
    [collectionPath in PathWhereIdentifier]?: {
      [key in string]: number | { [key in string]: unknown }
    }
  },
  simpleStoreOptions: SimpleStoreOptions,
): PluginFetchAggregateAction {
  return function ({
    payload,
    collectionPath,
    actionConfig,
    pluginModuleConfig,
  }: PluginFetchAggregateActionPayload<SimpleStoreModuleConfig>):
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
