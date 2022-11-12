import { isFunction, isPlainObject } from 'is-what'
import { GlobalConfig, ModuleConfig, PluginModuleConfig } from '@magnetarjs/types'
import { throwIfNolocalStoreName } from './throwFns'

export const MODULE_IDENTIFIER_SPLIT = ' /// '

/**
 * Saved as enum, just to enforce usage of `getPathFilterIdentifier()`
 */
export enum PathFilterIdentifier {
  'KEY' = 'modulePath + JSON.stringify({ where, orderBy, startAfter, limit })',
}

/**
 * Creates the `key` for the Maps used to cache certain values throughout the lifecycle of an instance.
 * @returns `modulePath + ' /// ' + JSON.stringify({ where, orderBy, startAfter, limit })`
 */
export function getPathFilterIdentifier(
  modulePath: string,
  moduleConfig: ModuleConfig
): PathFilterIdentifier {
  const { where, orderBy, startAfter, limit } = moduleConfig
  const config = JSON.stringify({ where, orderBy, startAfter, limit })

  return `${modulePath}${MODULE_IDENTIFIER_SPLIT}${config}` as unknown as PathFilterIdentifier.KEY
}

/**
 * Saved as enum, just to enforce usage of `getPathWhereOrderByIdentifier()`
 */
export enum PathWhereOrderByIdentifier {
  'KEY' = 'modulePath + JSON.stringify({ where, orderBy })',
}

/**
 * Creates the `key` for the Maps used to cache the last fetched (unknown) "thing" (only used by the plugin) throughout the lifecycle of an instance.
 * @returns `modulePath + ' /// ' + JSON.stringify({ where, orderBy })`
 */
export function getPathWhereOrderByIdentifier(
  modulePath: string,
  moduleConfig: ModuleConfig
): PathWhereOrderByIdentifier {
  const { where, orderBy } = moduleConfig
  const config = JSON.stringify({ where, orderBy })

  return `${modulePath}${MODULE_IDENTIFIER_SPLIT}${config}` as unknown as PathWhereOrderByIdentifier.KEY
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

  return getModuleData({ collectionPath, docId, pluginModuleConfig }) as any
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
