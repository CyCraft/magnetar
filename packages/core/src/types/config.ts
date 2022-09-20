import { O } from 'ts-toolbelt'
import { merge } from 'merge-anything'
import { GlobalConfig } from '@magnetarjs/types'

export function defaultsGlobalConfig(config: GlobalConfig): O.Compulsory<GlobalConfig> {
  const defaults: GlobalConfig = {
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
  return merged as any
}
