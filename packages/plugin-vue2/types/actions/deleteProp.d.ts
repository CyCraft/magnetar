import { PluginDeletePropAction } from '@magnetarjs/core';
import { ReactiveStoreOptions, MakeRestoreBackup } from '../CreatePlugin';
export declare function deletePropActionFactory(data: {
    [collectionPath: string]: Map<string, Record<string, any>>;
}, reactiveStoreOptions: ReactiveStoreOptions, makeBackup?: MakeRestoreBackup): PluginDeletePropAction;
