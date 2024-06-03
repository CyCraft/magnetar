import type { GlobalConfig } from '@magnetarjs/types'
import { merge } from 'merge-anything'

export function defaultsGlobalConfig(config: GlobalConfig): Required<GlobalConfig> {
  if (!('stores' in config)) {
    throw new Error(
      'GlobalConfig must have a stores property with at least one plugin provided for the `cache` key',
    )
  }
  const defaults: Omit<Required<GlobalConfig>, 'stores'> = {
    executionOrder: {
      read: [],
      write: [],
    },
    onError: 'revert',
    on: {},
    modifyPayloadOn: {},
    modifyReadResponseOn: {},
  }
  const merged = merge(defaults, config)
  return merged
}
