type CustomMap<DocDataType = Record<string, any>> = {
  // data
  /**
   * Returns the number of key/value pairs in the Map object.
   */
  size: number

  /**
   * Removes all key-value pairs from the Map object.
   */
  clear: () => void
  /**
   * Removes the value associated to the key from the Map object.
   * @returns {boolean} `true` if an element in the Map object existed and has been removed, or `false` if the element does not exist.
   */
  delete: (key: string) => boolean

  /**
   * Returns the value associated to the key, or undefined if there is none.
   */
  get: (key: string) => DocDataType
  /**
   * Returns a boolean asserting whether a value has been associated to the key in the Map object or not.
   */
  has: (key: string) => boolean

  /**
   * Returns a new Iterator object that contains the keys for each element in the Map object in insertion order.
   */
  keys: () => IterableIterator<string>
  /**
   * Returns a new Iterator object that contains the values for each element in the Map object in insertion order.
   */
  values: () => IterableIterator<DocDataType>
  /**
   * Returns a new Iterator object that contains an array of [key, value] for each element in the Map object in insertion order.
   */
  entries: () => IterableIterator<[string, DocDataType]>
  /**
   * Calls callbackFn once for each key-value pair present in the Map object, in insertion order. If a thisArg parameter is provided to forEach, it will be used as the this value for each callback.
   */
  forEach: (
    callbackfn: (
      value: DocDataType,
      key: string,
      map: Map<string, DocDataType>,
      thisArg?: any
    ) => void
  ) => void
}

export function objectToMap(
  object: Record<string, any> | undefined,
  originalObjectToClear: Record<string, any> | undefined,
  entriesInCustomOrder?: [string, Record<string, any>][]
): Map<string, Record<string, any>> {
  const dic = object || {}

  function get(id: string) {
    return dic[id]
  }
  function has(id: string) {
    return !!dic[id]
  }
  function keys() {
    if (entriesInCustomOrder) return entriesInCustomOrder.map((e) => e[0])
    return Object.keys(dic)
    // return IterableIterator<string>
  }
  function values() {
    if (entriesInCustomOrder) return entriesInCustomOrder.map((e) => e[1])
    return Object.values(dic)
    // return IterableIterator<Record<string, any>>
  }
  function entries() {
    if (entriesInCustomOrder) return entriesInCustomOrder
    return Object.entries(dic)
    // return IterableIterator<[string, Record<string, any>]>
  }
  function clear() {
    if (!originalObjectToClear) return
    if (entriesInCustomOrder) {
      entriesInCustomOrder.forEach(([key]) => {
        delete originalObjectToClear[key]
      })
    } else {
      Object.keys(originalObjectToClear).forEach((key) => {
        delete originalObjectToClear[key]
      })
    }
  }
  function _delete(id: string) {
    const existed = id in dic
    if (existed) delete dic[id]
    return existed
  }
  function forEach(
    callbackfn: (value: any, key: string, map: Map<string, any>, thisArg?: any) => void
  ) {
    const _entries = entriesInCustomOrder || Object.entries(dic)

    _entries.forEach(([k, v]) => {
      callbackfn(v, k, new Map())
    })
  }

  const raw = dic

  const customMap: CustomMap = {
    size: Object.keys(dic).length,
    get,
    has,
    keys,
    values,
    entries,
    forEach,
    clear,
    delete: _delete,
    raw,
  } as any
  return customMap as any
}
