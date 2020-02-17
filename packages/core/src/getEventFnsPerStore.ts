import { Config, EventName, EventFn, EventFnsPerStore } from './types/base'

export default function getEventFnsPerStore (
  globalConfig: Partial<Config>,
  moduleConfig: Partial<Config>,
  actionConfig: Partial<Config>
): EventFnsPerStore {
  const result = [globalConfig, moduleConfig, actionConfig].reduce((carry, configPartial) => {
    const onPerStore = configPartial.on || {}
    Object.entries(onPerStore).forEach(([storeName, eventFnMap]) => {
      if (!(storeName in carry)) carry[storeName] = {}
      Object.entries(eventFnMap).forEach(([eventName, eventFn]: [EventName, EventFn]) => {
        if (!(eventName in carry[storeName])) carry[storeName][eventName] = []
        carry[storeName][eventName].push(eventFn)
      })
    }, {})
    return carry
  }, {} as EventFnsPerStore)
  return result
}
