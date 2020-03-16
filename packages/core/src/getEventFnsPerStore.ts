import { SharedConfig } from './types/base'
import {
  EventName,
  EventFn,
  EventFnsPerStore,
  EventFnBefore,
  EventFnSuccess,
  EventFnError,
  EventFnRevert,
} from './types/events'
import { ActionConfig } from './types/actions'

export function getEventFnsPerStore (
  globalConfig: Partial<SharedConfig>,
  moduleConfig: Partial<SharedConfig>,
  actionConfig: ActionConfig
): EventFnsPerStore {
  const result = [globalConfig, moduleConfig, actionConfig].reduce((carry, configPartial) => {
    const onPerStore = configPartial.on || {}
    Object.entries(onPerStore).forEach(([storeName, eventFnMap]) => {
      if (!(storeName in carry)) carry[storeName] = {}
      Object.entries(eventFnMap).forEach(([eventName, eventFn]: [EventName, EventFn]) => {
        if (!(eventName in carry[storeName])) carry[storeName][eventName] = []
        // todo: why is this not type safe?
        // carry[storeName][eventName].push(eventFn)
        if (eventName === 'before') carry[storeName].before.push(eventFn as EventFnBefore)
        if (eventName === 'success') carry[storeName].success.push(eventFn as EventFnSuccess)
        if (eventName === 'error') carry[storeName].error.push(eventFn as EventFnError)
        if (eventName === 'revert') carry[storeName].revert.push(eventFn as EventFnRevert)
      })
    }, {})
    return carry
  }, {} as EventFnsPerStore)
  return result
}
