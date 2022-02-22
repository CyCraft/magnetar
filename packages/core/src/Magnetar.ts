import { O } from 'ts-toolbelt'
import { createCollectionWithContext, CollectionInstance } from './Collection'
import { GlobalConfig, ModuleConfig, defaultsGlobalConfig } from './types/config'
import { createDocWithContext, DocInstance } from './Doc'
import { FetchPromises } from './types/actions'
import { throwIfInvalidModulePath } from './helpers/throwFns'
import { getCollectionPathDocIdEntry } from './helpers/pathHelpers'
import {
  getPathFilterIdentifier,
  PathFilterIdentifier,
  MODULE_IDENTIFIER_SPLIT,
} from './helpers/moduleHelpers'

export { isDocModule, isCollectionModule } from './helpers/pathHelpers'

/**
 * This is the global Magnetar instance that is returned when instantiating with Magnetar()
 */
export interface MagnetarInstance {
  globalConfig: O.Compulsory<GlobalConfig>
  /**
   * @see {@link CollectionFn}
   */
  collection: CollectionFn
  /**
   * @see {@link DocFn}
   */
  doc: DocFn
  /**
   * Clear all data of the entire Magnetar instance
   */
  clearAllData: () => Promise<void>
  /**
   * Close all streams of the entire Magnetar instance
   */
  closeAllStreams: () => Promise<void>
}

/**
 * The write lock promise that is resolved x seconds after the final write action has resolved
 */
export type WriteLock = {
  /** To be resolved after the countdown after the last write action finishes */
  promise: null | Promise<void>
  /** Resolves the `WriteLock['promise']` */
  resolve: () => any
  /** To be started after every write action & To be reset when a new write action occurs */
  countdown: null | ReturnType<typeof setTimeout>
}

/**
 * This is the `collection()` method type.
 * @see {@link CollectionInstance}
 */
export type CollectionFn<DocDataTypeInherited extends Record<string, any> = Record<string, any>> = <
  DocDataType extends Record<string, any> = DocDataTypeInherited
>(
  idOrPath: string,
  moduleConfig?: ModuleConfig
) => CollectionInstance<DocDataType>

/**
 * This is the `doc()` method type.
 * @see {@link DocInstance}
 */
export type DocFn<DocDataTypeInherited extends Record<string, any> = Record<string, any>> = <
  DocDataType extends Record<string, any> = DocDataTypeInherited
>(
  idOrPath: string,
  moduleConfig?: ModuleConfig
) => DocInstance<DocDataType>

/**
 * Creates a magnetar instance.
 * @see {@link GlobalConfig}
 * @see {@link MagnetarInstance}
 */
export function Magnetar(magnetarConfig: GlobalConfig): MagnetarInstance {
  // the passed GlobalConfig is merged onto defaults
  const globalConfig = defaultsGlobalConfig(magnetarConfig)

  /**
   * All collections visited so far, kept to be able to clear all data
   */
  const collectionNames = new Set<string>()

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

  async function clearAllData (): Promise<void> {
    for (const collectionName of collectionNames) {
      collection(collectionName).data?.clear()
    }
  }

  async function closeAllStreams (): Promise<void> {
    for (const collectionName of collectionNames) {
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

    // grab (and set) the WriteLock for this module
    if (!writeLockMap.has(modulePath)) {
      writeLockMap.set(modulePath, { promise: null, resolve: () => {}, countdown: null })
    }

    // grab (and set) the FetchPromises for this module
    if (!fetchPromiseMap.has(pathFilterIdentifier)) {
      fetchPromiseMap.set(pathFilterIdentifier, new Map())
    }
    const fetchPromises = fetchPromiseMap.get(pathFilterIdentifier)!

    // set the closeStreamFnMap and streamingPromiseMap for this module
    if (!closeStreamFnMap.has(pathFilterIdentifier)) {
      closeStreamFnMap.set(pathFilterIdentifier, () => {/** No stream open yet... */}) // prettier-ignore
    }
    if (!streamingPromiseMap.has(pathFilterIdentifier)) {
      streamingPromiseMap.set(pathFilterIdentifier, null)
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
      if (closeStreamFn) closeStreamFn()
    }
    function closeAllStreams(): void {
      for (const [identifier, closeStreamFn] of closeStreamFnMap) {
        const _modulePath = identifier.split(MODULE_IDENTIFIER_SPLIT)[0]
        if (_modulePath === modulePath) closeStreamFn()
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
    if (moduleType === 'doc') {
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
      [collectionPath, docId],
      moduleConfig,
      globalConfig,
      docFn,
      collectionFn,
      streamAndFetchPromises
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
    closeAllStreams,
  }
  return instance
}
