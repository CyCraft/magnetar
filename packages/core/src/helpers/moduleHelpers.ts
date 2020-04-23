import { isFunction, isMap, isPlainObject } from 'is-what'
import { GlobalConfig, ModuleConfig } from '../types/config'
import { throwIfNoDataStoreName, logErrorAndThrow } from './throwFns'
import { isDocModule } from './pathHelpers'
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
 * @param {string} modulePath
 * @param {ModuleConfig} moduleConfig
 */
export function executeSetupModulePerStore (
  globalConfigStores: GlobalConfig['stores'],
  modulePath: string,
  moduleConfig: ModuleConfig
): void {
  for (const storeName in globalConfigStores) {
    const { setupModule } = globalConfigStores[storeName]
    if (isFunction(setupModule)) {
      const pluginModuleConfig = getPluginModuleConfig(moduleConfig, storeName)
      setupModule(modulePath, pluginModuleConfig)
    }
  }
}

/**
 * Returns the data form the store specified as 'dataStoreName' but filtered as per the clauses
 *
 * @export
 * @template calledFrom
 * @template DocDataType
 * @param {string} modulePath
 * @param {ModuleConfig} moduleConfig
 * @param {GlobalConfig} globalConfig
 * @returns {calledFrom extends 'collection' ? Map<string, DocDataType> : <DocDataType>(modulePath: string) => DocDataType}
 */
export function getDataFromDataStore<calledFrom extends 'collection' | 'doc', DocDataType> (
  modulePath: string,
  moduleConfig: ModuleConfig,
  globalConfig: GlobalConfig
): calledFrom extends 'collection'
  ? Map<string, DocDataType>
  : <DocDataType>(modulePath: string) => DocDataType {
  const dataStoreName = moduleConfig.dataStoreName || globalConfig.dataStoreName
  throwIfNoDataStoreName(dataStoreName)
  const { getModuleData } = globalConfig.stores[dataStoreName]
  const pluginModuleConfig = getPluginModuleConfig(moduleConfig, dataStoreName)

  // docs
  if (isDocModule(modulePath)) {
    return ((_modulePath: string) => getModuleData(_modulePath, pluginModuleConfig)) as any
  }
  // collections
  const data = getModuleData(modulePath, pluginModuleConfig)
  if (!isMap(data)) {
    logErrorAndThrow('Collections must return a Map')
  }
  return data as any
}
