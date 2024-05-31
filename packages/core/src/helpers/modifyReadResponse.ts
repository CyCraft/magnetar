import type { ModifyReadResponseFnMap, ModifyReadResponseFnsMap } from '@magnetarjs/types'

export function getModifyReadResponseFnsMap(
  ...onMaps: (ModifyReadResponseFnMap | undefined)[]
): ModifyReadResponseFnsMap {
  const _onMaps = onMaps.filter(Boolean) as ModifyReadResponseFnMap[]
  const result = {
    added: _onMaps.flatMap((on) => on.added ?? []),
    modified: _onMaps.flatMap((on) => on.modified ?? []),
    removed: _onMaps.flatMap((on) => on.removed ?? []),
  }
  return result
}
