/**
 * Tries to find a value of a map for a given key. The key does not have to be the original payload passed.
 */
export function findMapValueForKey(map: Map<any, any> | undefined, mapKey: any): any {
  if (!map) return undefined
  const mapKeys = [...map.keys()]
  // @ts-ignore
  const keyIndex = mapKeys.map(JSON.stringify).findIndex((str) => str === JSON.stringify(mapKey)) // prettier-ignore
  if (keyIndex === -1) return undefined
  const originalPayload = mapKeys[keyIndex]
  return map.get(originalPayload)
}
