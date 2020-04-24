import { O } from 'ts-toolbelt'
import { merge } from 'merge-anything'
import { createCollectionWithContext, CollectionInstance } from './Collection'
import { SharedConfig, GlobalConfig, ModuleConfig } from './types/config'
import { PlainObject } from './types/atoms'
import { createDocWithContext, DocInstance } from './Doc'
import { OpenStreams } from './types/actions'
import { throwIfInvalidId } from './helpers/throwFns'

export { isDocModule, isCollectionModule } from './helpers/pathHelpers'

function configWithDefaults (config: GlobalConfig): O.Compulsory<GlobalConfig> {
  const defaults: SharedConfig = {
    executionOrder: {
      read: [],
      write: [],
    },
    onError: 'revert',
    on: {},
    modifyPayloadOn: {},
    modifyReadResponseOn: {},
    dataStoreName: '',
  }
  const merged = merge(defaults, config)
  return merged
}

/**
 * This is the global Vue Sync instance that is returned when instantiating with VueSync()
 */
export interface VueSyncInstance {
  globalConfig: O.Compulsory<GlobalConfig>
  collection: CollectionFn
  doc: DocFn
}

/**
 * This is the type for calling `collection()`
 */
export type CollectionFn<DocDataTypeInherited extends object = PlainObject> = <
  DocDataType extends object = DocDataTypeInherited
>(
  idOrPath: string,
  moduleConfig?: ModuleConfig
) => CollectionInstance<DocDataType>

/**
 * This is the type for calling `doc()`
 */
export type DocFn<DocDataTypeInherited extends object = PlainObject> = <
  DocDataType extends object = DocDataTypeInherited
>(
  idOrPath: string,
  moduleConfig?: ModuleConfig
) => DocInstance<DocDataType>

export function VueSync (vueSyncConfig: GlobalConfig): VueSyncInstance {
  // the passed GlobalConfig is merged onto defaults
  const globalConfig = configWithDefaults(vueSyncConfig)

  type ModuleIdentifier = { idOrPath: string; moduleConfig: ModuleConfig }
  /**
   * takes care of the caching instances of modules. Todo: double check memory leaks for when an instance isn't referenced anymore.
   */
  const moduleMap: WeakMap<ModuleIdentifier, any> = new WeakMap() // apply type upon get/set
  /**
   * the global storage for subscriptions
   */
  const streamSubscribtionMap: Map<string, OpenStreams> = new Map() // apply type upon get/set

  function getModuleInstance (
    idOrPath: string,
    moduleConfig: ModuleConfig = {},
    moduleType: 'doc' | 'collection',
    docFn: DocFn,
    collectionFn: CollectionFn
  ): CollectionInstance | DocInstance {
    throwIfInvalidId(idOrPath, moduleType)
    // retrieved the cached instance
    const moduleIdentifier = { idOrPath, moduleConfig }
    const _moduleMap: WeakMap<ModuleIdentifier, CollectionInstance | DocInstance> = moduleMap
    const cachedInstance = _moduleMap.get(moduleIdentifier)
    if (cachedInstance) return cachedInstance
    // else create and cache a new instance
    // first create the stream subscribtion map for this module
    if (!streamSubscribtionMap.has(idOrPath)) {
      streamSubscribtionMap.set(idOrPath, new Map())
    }
    const openStreams = streamSubscribtionMap.get(idOrPath)
    // then create the module instance
    const createInstanceWithContext =
      moduleType === 'doc' ? createDocWithContext : createCollectionWithContext
    // @ts-ignore
    const moduleInstance = createInstanceWithContext(
      idOrPath,
      moduleConfig,
      globalConfig,
      docFn,
      collectionFn,
      openStreams
    )
    moduleMap.set(moduleIdentifier, moduleInstance)
    return moduleInstance
  }

  function collection (idOrPath: string, moduleConfig: ModuleConfig = {}): CollectionInstance {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return getModuleInstance(idOrPath, moduleConfig, 'collection', doc as DocFn, collection as CollectionFn) as CollectionInstance // prettier-ignore
  }

  function doc (idOrPath: string, moduleConfig: ModuleConfig = {}): DocInstance {
    return getModuleInstance(idOrPath, moduleConfig, 'doc', doc as DocFn, collection as CollectionFn) as DocInstance // prettier-ignore
  }

  const instance: VueSyncInstance = {
    globalConfig,
    collection: collection as CollectionFn,
    doc: doc as DocFn,
  }
  return instance
}
