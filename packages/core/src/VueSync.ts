import { O } from 'ts-toolbelt'
import { merge } from 'merge-anything'
import { createCollectionWithContext, CollectionInstance } from './Collection'
import { SharedConfig, GlobalConfig, ModuleConfig } from './types/config'
import { PlainObject } from './types/atoms'
import { createDocWithContext, DocInstance } from './Doc'

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
export type CollectionFn<DocDataTypeInherited = PlainObject> = <DocDataType = DocDataTypeInherited>(
  idOrPath: string,
  moduleConfig?: ModuleConfig
) => CollectionInstance<DocDataType>

/**
 * This is the type for calling `doc()`
 */
export type DocFn<DocDataTypeInherited = PlainObject> = <DocDataType = DocDataTypeInherited>(
  idOrPath: string,
  moduleConfig?: ModuleConfig
) => DocInstance<DocDataType>

export function VueSync (vueSyncConfig: GlobalConfig): VueSyncInstance {
  // the passed GlobalConfig is merged onto defaults
  const globalConfig = configWithDefaults(vueSyncConfig)

  const moduleMap = new Map() // apply type upon get/set

  function collection<DocDataType> (
    idOrPath: string,
    moduleConfig: ModuleConfig = {}
  ): CollectionInstance<DocDataType> {
    // retrieved the cached instance
    const _moduleMap: Map<string, CollectionInstance<DocDataType>> = moduleMap
    const cachedInstance = _moduleMap.get(idOrPath)
    if (cachedInstance) return cachedInstance
    // else create and cache a new instance
    const moduleInstance = createCollectionWithContext<DocDataType>(
      idOrPath,
      moduleConfig,
      globalConfig,
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      doc,
      collection
    )
    moduleMap.set(idOrPath, moduleInstance)
    return moduleInstance
  }

  function doc<DocDataType> (
    idOrPath: string,
    moduleConfig: ModuleConfig = {}
  ): DocInstance<DocDataType> {
    // retrieved the cached instance
    const _moduleMap: Map<string, DocInstance<DocDataType>> = moduleMap
    const cachedInstance = _moduleMap.get(idOrPath)
    if (idOrPath && cachedInstance) return cachedInstance
    // else create and cache a new instance
    const moduleInstance = createDocWithContext<DocDataType>(
      idOrPath,
      moduleConfig,
      globalConfig,
      doc,
      collection
    )
    moduleMap.set(moduleInstance.id, moduleInstance)
    return moduleInstance
  }

  const instance: VueSyncInstance = {
    globalConfig,
    collection,
    doc,
  }
  return instance
}
