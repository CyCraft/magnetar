import { GlobalConfig, ModuleConfig } from '../types/base'
import { isFunction, isMap } from 'is-what'
import { throwIfNoDataStoreName, logError, logErrorAndThrow } from './throwFns'
import { isDocModule } from './pathHelpers'

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
) {
  for (const storeName in globalConfigStores) {
    const { setupModule } = globalConfigStores[storeName]
    if (isFunction(setupModule)) {
      const moduleConfigPerStore = moduleConfig?.configPerStore || {}
      const pluginModuleConfig = moduleConfigPerStore[storeName] || {}
      setupModule(modulePath, pluginModuleConfig)
    }
  }
}
/**
 * The store specified as 'dataStoreName' should return data
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
  const storeModuleConfig = moduleConfig?.configPerStore?.[dataStoreName] || {}

  if (isDocModule(modulePath)) {
    return ((_modulePath: string) =>
      getModuleData<DocDataType>(_modulePath, storeModuleConfig)) as any
  }
  const data = getModuleData<DocDataType>(modulePath, storeModuleConfig)
  if (!isMap(data)) {
    logErrorAndThrow('Collections must return a Map')
  }
  return data as any
}
