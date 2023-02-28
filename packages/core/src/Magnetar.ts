import { mapGetOrSet } from 'getorset-anything'
import { isString } from 'is-what'
import { createCollectionWithContext } from './Collection'
import { defaultsGlobalConfig } from './helpers/configHelpers'
import { createDocWithContext } from './Doc'
import { getCollectionPathDocIdEntry } from './helpers/pathHelpers'
import {
  MagnetarInstance,
  CollectionInstance,
  DocInstance,
  FetchPromises,
  GlobalConfig,
  ModuleConfig,
  WriteLock,
  DocFn,
  CollectionFn,
  FetchMetaDataCollection,
  CollectionName,
  getPathFilterIdentifier,
  PathFilterIdentifier,
  MODULE_IDENTIFIER_SPLIT,
  PathWhereOrderByIdentifier,
  getPathWhereOrderByIdentifier,
} from '@magnetarjs/types'
import { throwIfInvalidModulePath } from './helpers/throwFns'

/**
 * Creates a magnetar instance.
 * @see {@link GlobalConfig}
 * @see {@link MagnetarInstance}
 */
export function Magnetar(magnetarConfig: GlobalConfig): MagnetarInstance {
  /**
   * the passed GlobalConfig is merged onto defaults
   */
  const globalConfig = defaultsGlobalConfig(magnetarConfig)
  /**
   * All collections visited so far, kept to be able to clear all data
   */
  const collectionNames = new Set<CollectionName>()
  /**
   * the global storage for WriteLock objects
   * @see {@link WriteLock}
   */
  const writeLockMap: Map<string, WriteLock> = new Map() // apply type upon get/set
  /**
   * the global storage for closeStream functions
   */
  const closeStreamFnMap: Map<PathFilterIdentifier, () => void> = new Map() // apply type upon get/set
  /**
   * the global storage for open stream promises
   */
  const streamingPromiseMap: Map<PathFilterIdentifier, Promise<void> | null> = new Map() // apply type upon get/set
  /**
   * the global storage for fetch promises
   */
  const fetchPromiseMap: Map<PathFilterIdentifier, FetchPromises> = new Map() // apply type upon get/set
  /**
   * the global storage for FetchMetaDataCollection
   */
  const fetchMetaMap: Map<PathWhereOrderByIdentifier, FetchMetaDataCollection> = new Map()

  async function clearAllData(options?: { exclude?: CollectionName[] }): Promise<void> {
    for (const collectionName of collectionNames) {
      if (options?.exclude?.includes(collectionName)) continue
      collection(collectionName).data?.clear()
    }
  }

  /** _ to prevent name clash */
  async function _closeAllStreams(options?: { exclude?: CollectionName[] }): Promise<void> {
    for (const collectionName of collectionNames) {
      if (options?.exclude?.includes(collectionName)) continue
      collection(collectionName).closeAllStreams()
    }
  }

  function getModuleInstance(
    modulePath: string,
    moduleConfig: ModuleConfig = {},
    moduleType: 'doc' | 'collection',
    docFn: DocFn,
    collectionFn: CollectionFn
  ): CollectionInstance | DocInstance {
    throwIfInvalidModulePath(modulePath, moduleType)

    const [collectionPath, docId] = getCollectionPathDocIdEntry(modulePath)
    collectionNames.add(collectionPath)

    const pathFilterIdentifier = getPathFilterIdentifier(modulePath, moduleConfig)

    // grab (and set) the FetchPromises for this module
    const fetchPromises = mapGetOrSet(
      fetchPromiseMap,
      pathFilterIdentifier,
      (): FetchPromises => new Map()
    )
    // Create the FetchMeta helpers for this module
    const pathWhereOrderByIdentifier = getPathWhereOrderByIdentifier(modulePath, moduleConfig)
    const fetchMeta: {
      get: () => FetchMetaDataCollection
      set: (payload: FetchMetaDataCollection) => void
    } = {
      get: () =>
        fetchMetaMap.get(pathWhereOrderByIdentifier) || { reachedEnd: false, cursor: undefined },
      set: (payload: FetchMetaDataCollection) =>
        fetchMetaMap.set(pathWhereOrderByIdentifier, payload),
    }

    // grab the stream related functions
    function cacheStream(closeStreamFn: () => void, streamingPromise: Promise<void> | null): void {
      closeStreamFnMap.set(pathFilterIdentifier, closeStreamFn)
      streamingPromiseMap.set(pathFilterIdentifier, streamingPromise)
    }
    function streaming(): Promise<void> | null {
      return streamingPromiseMap.get(pathFilterIdentifier) || null
    }
    function closeStream(): void {
      const closeStreamFn = closeStreamFnMap.get(pathFilterIdentifier)
      if (closeStreamFn) {
        closeStreamFn()
        setTimeout(() => {
          streamingPromiseMap.delete(pathFilterIdentifier)
          closeStreamFnMap.delete(pathFilterIdentifier)
        })
      }
    }
    function closeAllStreams(): void {
      for (const [identifier, closeStreamFn] of closeStreamFnMap) {
        const openStreamPath = identifier.split(MODULE_IDENTIFIER_SPLIT)[0]
        if (openStreamPath === modulePath || openStreamPath.startsWith(modulePath + '/')) {
          closeStreamFn()
        }
      }
    }

    const streamAndFetchPromises = {
      writeLockMap,
      fetchPromises,
      cacheStream,
      streaming,
      closeStream,
      closeAllStreams,
    }

    // then create the module instance
    if (moduleType === 'doc' && isString(docId)) {
      return createDocWithContext(
        [collectionPath, docId],
        moduleConfig,
        globalConfig,
        docFn,
        collectionFn,
        streamAndFetchPromises
      )
    }

    return createCollectionWithContext(
      collectionPath,
      moduleConfig,
      globalConfig,
      docFn,
      collectionFn,
      streamAndFetchPromises,
      fetchMeta
    )
  }

  function collection(modulePath: string, moduleConfig: ModuleConfig = {}): CollectionInstance {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return getModuleInstance(modulePath, moduleConfig, 'collection', doc as DocFn, collection as CollectionFn) as CollectionInstance // prettier-ignore
  }

  function doc(modulePath: string, moduleConfig: ModuleConfig = {}): DocInstance {
    return getModuleInstance(modulePath, moduleConfig, 'doc', doc as DocFn, collection as CollectionFn) as DocInstance // prettier-ignore
  }

  const instance: MagnetarInstance = {
    globalConfig,
    collection: collection as CollectionFn,
    doc: doc as DocFn,
    clearAllData,
    closeAllStreams: _closeAllStreams,
  }
  return instance
}
