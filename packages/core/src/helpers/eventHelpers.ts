import type { EventNameFnMap, EventNameFnsMap } from '@magnetarjs/types'

export function getEventNameFnsMap(...onMaps: (EventNameFnMap | void)[]): EventNameFnsMap {
  const _onMaps = onMaps.filter(Boolean) as EventNameFnMap[]
  const result: EventNameFnsMap = {
    before: _onMaps.flatMap((on) => on.before ?? []),
    success: _onMaps.flatMap((on) => on.success ?? []),
    error: _onMaps.flatMap((on) => on.error ?? []),
    revert: _onMaps.flatMap((on) => on.revert ?? []),
  }
  return result
}
