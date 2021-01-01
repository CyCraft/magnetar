import { PluginWriteAction } from '@magnetarjs/core';
import { Vue2StoreOptions, MakeRestoreBackup } from '../CreatePlugin';
export declare function writeActionFactory(data: {
    [collectionPath: string]: Map<string, Record<string, any>>;
}, reactiveStoreOptions: Vue2StoreOptions, actionName: 'merge' | 'assign' | 'replace', makeBackup?: MakeRestoreBackup): PluginWriteAction;
