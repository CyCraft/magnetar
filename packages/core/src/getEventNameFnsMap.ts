import { SharedConfig } from './types/base'
import { EventName, EventFn, EventNameFnsMap, eventFnsMapWithDefaults } from './types/events'
import { ActionConfig } from './types/actions'

export function getEventNameFnsMap (
  globalConfig: Partial<SharedConfig>,
  moduleConfig: Partial<SharedConfig>,
  actionConfig: ActionConfig
): EventNameFnsMap {
  const eventFnsMap = eventFnsMapWithDefaults()
  const result = [globalConfig, moduleConfig, actionConfig].reduce((carry, configPartial) => {
    const onPerEvent = configPartial.on || {}
    Object.entries(onPerEvent).forEach(([eventName, eventFn]: [EventName, EventFn]) => {
      // @ts-ignore
      carry[eventName].push(eventFn)
    })
    return carry
  }, eventFnsMap)
  return result
}
