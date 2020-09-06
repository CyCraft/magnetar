import { GlobalConfig, ModuleConfig } from '../types/config';
import { PluginModuleConfig } from '../types/plugins';
/**
 * Extracts the PluginModuleConfig from the ModuleConfig
 *
 * @export
 * @param {ModuleConfig} moduleConfig
 * @param {string} storeName
 * @returns {PluginModuleConfig}
 */
export declare function getPluginModuleConfig(moduleConfig: ModuleConfig, storeName: string): PluginModuleConfig;
/**
 * Executes 'setupModule' function per store, when the collection or doc is instantiated.
 *
 * @export
 * @param {GlobalConfig['stores']} globalConfigStores
 * @param {[string, string | undefined]} [collectionPath, docId]
 * @param {ModuleConfig} moduleConfig
 */
export declare function executeSetupModulePerStore(globalConfigStores: GlobalConfig['stores'], [collectionPath, docId]: [string, string | undefined], moduleConfig: ModuleConfig): void;
/**
 * Returns the `getModuleData` function form the store specified as 'dataStoreName'
 *
 * @export
 * @template DocDataType
 * @param {ModuleConfig} moduleConfig
 * @param {GlobalConfig} globalConfig
 * @returns {(collectionPath: string, docId: string | undefined) => (Map<string, DocDataType> | DocDataType)}
 */
export declare function getDataFnFromDataStore<DocDataType>(moduleConfig: ModuleConfig, globalConfig: GlobalConfig): (collectionPath: string, docId: string | undefined) => Map<string, DocDataType> | DocDataType;
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
export declare function getDataProxyHandler<calledFrom extends 'doc' | 'collection', DocDataType>([collectionPath, docId]: [string, string | undefined], moduleConfig: ModuleConfig, globalConfig: GlobalConfig): calledFrom extends 'doc' ? {
    get: (...p: any[]) => DocDataType;
} : {
    get: (...p: any[]) => Map<string, DocDataType>;
};
