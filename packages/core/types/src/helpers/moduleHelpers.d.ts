import { GlobalConfig, ModuleConfig } from '../types/base';
/**
 * Executes 'setupModule' function per store, when the collection or doc is instantiated.
 *
 * @export
 * @param {GlobalConfig['stores']} globalConfigStores
 * @param {string} modulePath
 * @param {ModuleConfig} moduleConfig
 */
export declare function executeSetupModulePerStore(globalConfigStores: GlobalConfig['stores'], modulePath: string, moduleConfig: ModuleConfig): void;
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
export declare function getDataFromDataStore<calledFrom extends 'collection' | 'doc', DocDataType>(modulePath: string, moduleConfig: ModuleConfig, globalConfig: GlobalConfig): calledFrom extends 'collection' ? Map<string, DocDataType> : <DocDataType>(modulePath: string) => DocDataType;
