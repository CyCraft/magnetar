import { O } from 'ts-toolbelt';
import { CollectionInstance } from './Collection';
import { GlobalConfig, ModuleConfig } from './types/config';
import { PlainObject } from './types/atoms';
import { DocInstance } from './Doc';
export { isDocModule, isCollectionModule } from './helpers/pathHelpers';
/**
 * This is the global Vue Sync instance that is returned when instantiating with VueSync()
 */
export interface VueSyncInstance {
    globalConfig: O.Compulsory<GlobalConfig>;
    collection: CollectionFn;
    doc: DocFn;
}
/**
 * This is the type for calling `collection()`
 */
export declare type CollectionFn<DocDataTypeInherited = PlainObject> = <DocDataType = DocDataTypeInherited>(idOrPath: string, moduleConfig?: ModuleConfig) => CollectionInstance<DocDataType>;
/**
 * This is the type for calling `doc()`
 */
export declare type DocFn<DocDataTypeInherited = PlainObject> = <DocDataType = DocDataTypeInherited>(idOrPath: string, moduleConfig?: ModuleConfig) => DocInstance<DocDataType>;
export declare function VueSync(vueSyncConfig: GlobalConfig): VueSyncInstance;
