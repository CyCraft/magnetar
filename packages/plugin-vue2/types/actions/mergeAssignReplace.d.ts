import { PluginWriteAction } from '@magnetarjs/core';
import { Vue2StoreOptions, MakeRestoreBackup } from '../CreatePlugin';
export declare function writeActionFactory(data: {
    [collectionPath: string]: Record<string, Record<string, any>>;
}, vue2StoreOptions: Vue2StoreOptions, actionName: 'merge' | 'assign' | 'replace', makeBackup?: MakeRestoreBackup): PluginWriteAction;
