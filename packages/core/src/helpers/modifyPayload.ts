import type { ModifyPayloadFnMap, ModifyPayloadFnsMap } from '@magnetarjs/types'

export function getModifyPayloadFnsMap(
  ...onMaps: (ModifyPayloadFnMap | undefined)[]
): Omit<ModifyPayloadFnsMap, 'write' | 'read'> {
  const _onMaps = onMaps.filter(Boolean) as ModifyPayloadFnMap[]
  const writeFns = _onMaps.flatMap((on) => on.write ?? [])
  const readFns = _onMaps.flatMap((on) => on.read ?? [])
  // const deleteFns = _onMaps.flatMap(on => on.delete ?? [])
  const result = {
    insert: _onMaps.flatMap((on) => on.insert ?? []).concat(writeFns),
    merge: _onMaps.flatMap((on) => on.merge ?? []).concat(writeFns),
    assign: _onMaps.flatMap((on) => on.assign ?? []).concat(writeFns),
    replace: _onMaps.flatMap((on) => on.replace ?? []).concat(writeFns),
    deleteProp: _onMaps.flatMap((on) => on.deleteProp ?? []),
    delete: [] as never[], // delete has no payload
    stream: _onMaps.flatMap((on) => on.stream ?? []).concat(readFns),
    fetch: _onMaps.flatMap((on) => on.fetch ?? []).concat(readFns),
  }
  return result
}
