import { O } from 'ts-toolbelt'
import { merge } from 'merge-anything'
import { createCollectionWithContext, CollectionInstance } from './Collection'
import { SharedConfig, GlobalConfig, ModuleConfig } from './types/config'
import { createDocWithContext, DocInstance } from './Doc'
import {
  OpenStreams,
  OpenStreamPromises,
  FindStream,
  FindStreamPromise,
  FetchPromises,
} from './types/actions'
import { throwIfInvalidModulePath } from './helpers/throwFns'
import { getCollectionPathDocIdEntry } from './helpers/pathHelpers'
import { findMapValueForKey } from './helpers/mapHelpers'

export { isDocModule, isCollectionModule } from './helpers/pathHelpers'

function configWithDefaults(config: GlobalConfig): O.Compulsory<GlobalConfig> {
  const defaults: SharedConfig = {
    executionOrder: {
      read: [],
      write: [],
    },
    onError: 'revert',
    on: {},
    modifyPayloadOn: {},
    modifyReadResponseOn: {},
    localStoreName: '',
  }
  const merged = merge(defaults, config)
  return merged as any
}

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
  const globalConfig = configWithDefaults(magnetarConfig)

  type ModuleIdentifier = { modulePath: string; moduleConfig: ModuleConfig }
  /**
   * takes care of the caching instances of modules. Todo: double check memory leaks for when an instance isn't referenced anymore.
   */
  const moduleMap: WeakMap<ModuleIdentifier, any> = new WeakMap() // apply type upon get/set
  /**
   * the global storage for closeStream functions
   */
  const streamCloseFnMap: Map<string, OpenStreams> = new Map() // apply type upon get/set
  /**
   * the global storage for open stream promises
   */
  const streamPromiseMap: Map<string, OpenStreamPromises> = new Map() // apply type upon get/set
  /**
   * the global storage for fetch promises
   */
  const fetchPromiseMap: Map<string, FetchPromises> = new Map() // apply type upon get/set

  function getModuleInstance(
    modulePath: string,
    moduleConfig: ModuleConfig = {},
    moduleType: 'doc' | 'collection',
    docFn: DocFn,
    collectionFn: CollectionFn
  ): CollectionInstance | DocInstance {
    throwIfInvalidModulePath(modulePath, moduleType)
    const [collectionPath, docId] = getCollectionPathDocIdEntry(modulePath)
    // retrieved the cached instance
    const moduleIdentifier = { modulePath, moduleConfig }
    const _moduleMap: WeakMap<ModuleIdentifier, CollectionInstance | DocInstance> = moduleMap
    const cachedInstance = _moduleMap.get(moduleIdentifier)
    if (cachedInstance) return cachedInstance
    // else create and cache a new instance

    // create the streamCloseFnMap and streamPromiseMap for this module
    if (!streamCloseFnMap.has(modulePath)) {
      streamCloseFnMap.set(modulePath, new Map())
    }
    if (!streamPromiseMap.has(modulePath)) {
      streamPromiseMap.set(modulePath, new Map())
    }
    // create the fetchPromiseMap for this module
    if (!fetchPromiseMap.has(modulePath)) {
      fetchPromiseMap.set(modulePath, new Map())
    }

    // grab the open stream utils
    const openStreams = streamCloseFnMap.get(modulePath) as OpenStreams
    const findStream: FindStream = (streamPayload: any) =>
      findMapValueForKey(openStreams, streamPayload)
    // grab the fetch promise utils
    const fetchPromises = fetchPromiseMap.get(modulePath) as FetchPromises

    const openStreamPromises = streamPromiseMap.get(modulePath) as OpenStreamPromises
    const findStreamPromise: FindStreamPromise = (streamPayload: any) =>
      findMapValueForKey(openStreamPromises, streamPayload)

    const streamAndFetchPromises = {
      openStreams,
      findStream,
      openStreamPromises,
      findStreamPromise,
      fetchPromises,
    }
    // then create the module instance
    const createInstanceWithContext =
      moduleType === 'doc' ? createDocWithContext : createCollectionWithContext
    // @ts-ignore
    const moduleInstance = createInstanceWithContext(
      [collectionPath, docId],
      moduleConfig,
      globalConfig,
      docFn,
      collectionFn,
      streamAndFetchPromises
    )
    moduleMap.set(moduleIdentifier, moduleInstance)
    return moduleInstance
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
