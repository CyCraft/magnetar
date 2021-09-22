import { isFunction, isPlainObject } from 'is-what'
import { GlobalConfig, ModuleConfig } from '../types/config'
import { throwIfNolocalStoreName } from './throwFns'
import { PluginModuleConfig } from '../types/plugins'

export const MODULE_IDENTIFIER_SPLIT = ' /// '

/**
 * Saved as enum, just to enforce usage of `getModuleIdentifier()`
 */
export enum ModuleIdentifier {
  'KEY' = 'modulePath + JSON.stringify({limit, orderBy, where})',
}

/**
 * Creates the `key` for the Maps used to cache certain values throughout the lifecycle of an instance.
 * @returns `JSON.stringify({ modulePath, modulePath, limit, orderBy, where })`
 */
export function getModuleIdentifier(
  modulePath: string,
  moduleConfig: ModuleConfig
): ModuleIdentifier {
  const { limit, orderBy, where } = moduleConfig
  const config = JSON.stringify({ limit, orderBy, where })

  return `${modulePath}${MODULE_IDENTIFIER_SPLIT}${config}` as ModuleIdentifier.KEY
}

/**
 * Extracts the PluginModuleConfig from the ModuleConfig
 *
 * @export
 * @param {ModuleConfig} moduleConfig
 * @param {string} storeName
 * @returns {PluginModuleConfig}
 */
export function getPluginModuleConfig(
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
export function executeSetupModulePerStore(
  globalConfigStores: GlobalConfig['stores'],
  [collectionPath, docId]: [string, string | undefined],
  moduleConfig: ModuleConfig
): void {
  for (const storeName in globalConfigStores) {
    const { setupModule } = globalConfigStores[storeName]
    if (isFunction(setupModule)) {
      const pluginModuleConfig = getPluginModuleConfig(moduleConfig, storeName)
      setupModule({ collectionPath, docId, pluginModuleConfig })
    }
  }
}

/**
 * Returns the `getModuleData` function form the store specified as 'localStoreName'
 *
 * @export
 * @template DocDataType
 * @param {ModuleConfig} moduleConfig
 * @param {GlobalConfig} globalConfig
 * @returns {(collectionPath: string, docId: string | undefined) => (Map<string, DocDataType> | DocDataType)}
 */
export function getDataFnFromDataStore<DocDataType>(
  moduleConfig: ModuleConfig,
  globalConfig: GlobalConfig
): (collectionPath: string, docId: string | undefined) => Map<string, DocDataType> | DocDataType {
  const localStoreName = globalConfig.localStoreName
  throwIfNolocalStoreName(localStoreName)
  const getModuleData = globalConfig.stores[localStoreName].getModuleData
  if (!getModuleData) {
    throw new Error('The data store did not provide a getModuleData function!')
  }
  const pluginModuleConfig = getPluginModuleConfig(moduleConfig, localStoreName)

  return (collectionPath, docId): Map<string, DocDataType> | DocDataType =>
    getModuleData({ collectionPath, docId, pluginModuleConfig }) as any
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
export function getDataProxyHandler<calledFrom extends 'doc' | 'collection', DocDataType>(
  [collectionPath, docId]: [string, string | undefined],
  moduleConfig: ModuleConfig,
  globalConfig: GlobalConfig
): calledFrom extends 'doc'
  ? { get: (...p: any[]) => DocDataType }
  : { get: (...p: any[]) => Map<string, DocDataType> } {
  const getModuleData = getDataFnFromDataStore<DocDataType>(moduleConfig, globalConfig)
  const dataHandler = {
    get: function (target: any, key: any, proxyRef: any): any {
      if (key === 'data') return getModuleData(collectionPath, docId)
      return Reflect.get(target, key, proxyRef)
    },
  }
  return dataHandler as any
}
