import { O } from 'ts-toolbelt'
import { createCollectionWithContext, CollectionInstance } from './Collection'
import { GlobalConfig, ModuleConfig, defaultsGlobalConfig } from './types/config'
import { createDocWithContext, DocInstance } from './Doc'
import { FetchPromises } from './types/actions'
import { throwIfInvalidModulePath } from './helpers/throwFns'
import { getCollectionPathDocIdEntry } from './helpers/pathHelpers'
import {
  getModuleIdentifier,
  ModuleIdentifier,
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
   * the global storage for closeStream functions
   */
  const closeStreamFnMap: Map<ModuleIdentifier, () => void> = new Map() // apply type upon get/set
  /**
   * the global storage for open stream promises
   */
  const streamingPromiseMap: Map<ModuleIdentifier, Promise<void> | null> = new Map() // apply type upon get/set
  /**
   * the global storage for fetch promises
   */
  const fetchPromiseMap: Map<ModuleIdentifier, FetchPromises> = new Map() // apply type upon get/set

  function getModuleInstance(
    modulePath: string,
    moduleConfig: ModuleConfig = {},
    moduleType: 'doc' | 'collection',
    docFn: DocFn,
    collectionFn: CollectionFn
  ): CollectionInstance | DocInstance {
    throwIfInvalidModulePath(modulePath, moduleType)

    const [collectionPath, docId] = getCollectionPathDocIdEntry(modulePath)
    const moduleIdentifier = getModuleIdentifier(modulePath, moduleConfig)

    // create the closeStreamFnMap and streamingPromiseMap for this module
    if (!closeStreamFnMap.has(moduleIdentifier)) {
      closeStreamFnMap.set(moduleIdentifier, () => {/** No stream open yet... */}) // prettier-ignore
    }
    if (!streamingPromiseMap.has(moduleIdentifier)) {
      streamingPromiseMap.set(moduleIdentifier, null)
    }
    // create the fetchPromiseMap for this module
    if (!fetchPromiseMap.has(moduleIdentifier)) {
      fetchPromiseMap.set(moduleIdentifier, new Map())
    }

    function cacheStream(closeStreamFn: () => void, streamingPromise: Promise<void> | null): void {
      closeStreamFnMap.set(moduleIdentifier, closeStreamFn)
      streamingPromiseMap.set(moduleIdentifier, streamingPromise)
    }

    function streaming(): Promise<void> | null {
      return streamingPromiseMap.get(moduleIdentifier) || null
    }

    function closeStream(): void {
      const closeStreamFn = closeStreamFnMap.get(moduleIdentifier)
      if (closeStreamFn) closeStreamFn()
    }

    function closeAllStreams(): void {
      for (const [identifier, closeStreamFn] of closeStreamFnMap) {
        const _modulePath = identifier.split(MODULE_IDENTIFIER_SPLIT)[0]
        if (_modulePath === modulePath) closeStreamFn()
      }
    }

    // grab the fetch promise utils
    const fetchPromises = fetchPromiseMap.get(moduleIdentifier) as FetchPromises

    const streamAndFetchPromises = {
      cacheStream,
      streaming,
      closeStream,
      closeAllStreams,
      fetchPromises,
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
  }
  return instance
}
