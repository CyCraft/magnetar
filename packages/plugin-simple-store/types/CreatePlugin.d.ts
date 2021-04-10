import { MagnetarPlugin, ModuleConfig } from '@magnetarjs/core';
export interface SimpleStoreOptions {
    generateRandomId: () => string;
}
export interface SimpleStoreModuleConfig extends ModuleConfig {
    path?: string;
    initialData?: Record<string, any> | [string, Record<string, any>][];
}
export declare type MakeRestoreBackup = (collectionPath: string, docId: string) => void;
export declare const CreatePlugin: MagnetarPlugin<SimpleStoreOptions>;
