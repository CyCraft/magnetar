import { isFunction, isPlainObject } from 'is-what'
import { GlobalConfig, ModuleConfig, PluginModuleConfig } from '@magnetarjs/types'
import { throwIfNolocalStoreName } from './throwFns'

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
  const { where, orderBy, limit, startAfter, configPerStore = {} } = moduleConfig
  const extraStoreConfig = isPlainObject(configPerStore[storeName]) ? configPerStore[storeName] : {}
  return { ...extraStoreConfig, where, orderBy, limit, startAfter }
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

/** Executes the `getModuleData` function from the store specified as 'localStoreName' */
export function getDataFromDataStore(moduleConfig: ModuleConfig, globalConfig: GlobalConfig, collectionPath: string): Map<string, Record<string, any>> // prettier-ignore
/** Executes the `getModuleData` function from the store specified as 'localStoreName' */
export function getDataFromDataStore(moduleConfig: ModuleConfig, globalConfig: GlobalConfig, collectionPath: string, docId: string): Record<string, any> // prettier-ignore
/** Executes the `getModuleData` function from the store specified as 'localStoreName' */
export function getDataFromDataStore(
  moduleConfig: ModuleConfig,
  globalConfig: GlobalConfig,
  collectionPath: string,
  docId?: string
): Record<string, any> | Map<string, Record<string, any>> {
  const localStoreName = globalConfig.localStoreName
  throwIfNolocalStoreName(localStoreName)
  const getModuleData = globalConfig.stores[localStoreName].getModuleData
  if (!getModuleData) {
    throw new Error('The data store did not provide a getModuleData function!')
  }
  const pluginModuleConfig = getPluginModuleConfig(moduleConfig, localStoreName)

  return getModuleData({ collectionPath, docId, pluginModuleConfig })
}

/** Executes the `getModuleCount` function from the store specified as 'localStoreName' */
export function getCountFromDataStore(
  moduleConfig: ModuleConfig,
  globalConfig: GlobalConfig,
  collectionPath: string
): number {
  const localStoreName = globalConfig.localStoreName
  throwIfNolocalStoreName(localStoreName)
  const getModuleCount = globalConfig.stores[localStoreName].getModuleCount
  if (!getModuleCount) {
    throw new Error('The data store did not provide a getModuleCount function!')
  }
  const pluginModuleConfig = getPluginModuleConfig(moduleConfig, localStoreName)

  return getModuleCount({ collectionPath, pluginModuleConfig })
}

/**
 * Returns an object as proxy which will execute the given functions upon prop access for the params passed here
 */
export function proxify<T extends Record<string, unknown>, P extends Record<string, () => any>>(
  target: T,
  propExecutionDic: P
): T & { [key in keyof P]: ReturnType<P[key]> } {
  const dataHandler = {
    get: function (target: any, key: any, proxyRef: any): any {
      if (key in propExecutionDic) {
        return propExecutionDic[key]()
      }
      return Reflect.get(target, key, proxyRef)
    },
  }
  // eslint-disable-next-line tree-shaking/no-side-effects-in-initialization
  return new Proxy(target, dataHandler)
}
