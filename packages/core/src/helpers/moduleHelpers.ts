import { GlobalConfig, ModuleConfig } from '../types/base'
import { isFunction } from 'is-what'

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
