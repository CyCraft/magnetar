import type { GlobalConfig } from '@magnetarjs/types'
import { merge } from 'merge-anything'

export function defaultsGlobalConfig(config: GlobalConfig): Required<GlobalConfig> {
  const defaults: Required<GlobalConfig> = {
    localStoreName: '',
    stores: {},
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
