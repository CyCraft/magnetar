import { PlainObject, PluginDeletePropAction } from '@vue-sync/core';
import { SimpleStoreOptions, MakeRestoreBackup } from '../CreatePlugin';
export declare function deletePropActionFactory(data: {
    [collectionPath: string]: Map<string, PlainObject>;
}, simpleStoreOptions: SimpleStoreOptions, makeBackup?: MakeRestoreBackup): PluginDeletePropAction;
