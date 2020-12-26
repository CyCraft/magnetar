import { O } from 'ts-toolbelt';
import { CollectionInstance } from './Collection';
import { GlobalConfig, ModuleConfig } from './types/config';
import { DocInstance } from './Doc';
export { isDocModule, isCollectionModule } from './helpers/pathHelpers';
/**
 * This is the global Vue Sync instance that is returned when instantiating with Magnetar()
 */
export interface MagnetarInstance {
    globalConfig: O.Compulsory<GlobalConfig>;
    collection: CollectionFn;
    doc: DocFn;
}
/**
 * This is the type for calling `collection()`
 */
export declare type CollectionFn<DocDataTypeInherited extends Record<string, any> = Record<string, any>> = <DocDataType extends Record<string, any> = DocDataTypeInherited>(idOrPath: string, moduleConfig?: ModuleConfig) => CollectionInstance<DocDataType>;
/**
 * This is the type for calling `doc()`
 */
export declare type DocFn<DocDataTypeInherited extends Record<string, any> = Record<string, any>> = <DocDataType extends Record<string, any> = DocDataTypeInherited>(idOrPath: string, moduleConfig?: ModuleConfig) => DocInstance<DocDataType>;
export declare function Magnetar(magnetarConfig: GlobalConfig): MagnetarInstance;