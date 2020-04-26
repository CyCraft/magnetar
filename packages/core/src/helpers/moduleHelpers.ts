import { isFunction, isPlainObject } from 'is-what'
import { GlobalConfig, ModuleConfig } from '../types/config'
import { throwIfNoDataStoreName } from './throwFns'
import { PluginModuleConfig } from '../types/plugins'

/**
 * Extracts the PluginModuleConfig from the ModuleConfig
 *
 * @export
 * @param {ModuleConfig} moduleConfig
 * @param {string} storeName
 * @returns {PluginModuleConfig}
 */
export function getPluginModuleConfig (
  moduleConfig: ModuleConfig,
  storeName: string
): PluginModuleConfig {
  const { where, orderBy, limit, configPerStore = {} } = moduleConfig
  const extraStoreConfig = isPlainObject(configPerStore[storeName]) ? configPerStore[storeName] : {}
  return { ...extraStoreConfig, where, orderBy, limit }
}

/**
 * Executes 'setupModule' function per store, when the collection or doc is instantiated.
 *
 * @export
 * @param {GlobalConfig['stores']} globalConfigStores
 * @param {[string, string | undefined]} [collectionPath, docId]
 * @param {ModuleConfig} moduleConfig
 */
export function executeSetupModulePerStore (
  globalConfigStores: GlobalConfig['stores'],
  [collectionPath, docId]: [string, string | undefined],
  moduleConfig: ModuleConfig
): void {
  for (const storeName in globalConfigStores) {
    const { setupModule } = globalConfigStores[storeName]
    if (isFunction(setupModule)) {
      const pluginModuleConfig = getPluginModuleConfig(moduleConfig, storeName)
      setupModule([collectionPath, docId], pluginModuleConfig)
    }
  }
}

/**
 * Returns the `getModuleData` function form the store specified as 'dataStoreName'
 *
 * @export
 * @template DocDataType
 * @param {ModuleConfig} moduleConfig
 * @param {GlobalConfig} globalConfig
 * @returns {([collectionPath, docId]: [string, string | undefined]) => (Map<string, DocDataType> | DocDataType)}
 */
export function getDataFnFromDataStore<DocDataType> (
  moduleConfig: ModuleConfig,
  globalConfig: GlobalConfig
): ([collectionPath, docId]: [string, string | undefined]) =>
  | Map<string, DocDataType>
  | DocDataType {
  const dataStoreName = moduleConfig.dataStoreName || globalConfig.dataStoreName
  throwIfNoDataStoreName(dataStoreName)
  const { getModuleData } = globalConfig.stores[dataStoreName]
  const pluginModuleConfig = getPluginModuleConfig(moduleConfig, dataStoreName)

  return (([collectionPath, docId]: [string, string | undefined]) =>
    getModuleData([collectionPath, docId], pluginModuleConfig)) as any
}

/**
 * Returns an object with the `data` prop as proxy which triggers every time the data is accessed
 *
 * @export
 * @template calledFrom {'doc' | 'collection'}
 * @template DocDataType
 * @param {[string, string | undefined]} [collectionPath, docId]
 * @param {ModuleConfig} moduleConfig
 * @param {GlobalConfig} globalConfig
 * @returns {calledFrom extends 'doc' ? { get: (...p: any[]) => DocDataType } : { get: (...p: any[]) => Map<string, DocDataType> }}
 */
export function getDataProxyHandler<calledFrom extends 'doc' | 'collection', DocDataType> (
  [collectionPath, docId]: [string, string | undefined],
  moduleConfig: ModuleConfig,
  globalConfig: GlobalConfig
): calledFrom extends 'doc'
  ? { get: (...p: any[]) => DocDataType }
  : { get: (...p: any[]) => Map<string, DocDataType> } {
  const getModuleData = getDataFnFromDataStore<DocDataType>(moduleConfig, globalConfig)
  const dataHandler = {
    get: function (target: any, key: any, proxyRef: any): any {
      if (key === 'data') return getModuleData([collectionPath, docId])
      return Reflect.get(target, key, proxyRef)
    },
  }
  return dataHandler as any
}
