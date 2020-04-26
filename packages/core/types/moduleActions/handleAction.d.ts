import { ActionName } from '../types/actions';
import { SharedConfig } from '../types/config';
import { PlainObject } from '../types/atoms';
import { EventNameFnsMap } from '../types/events';
import { PluginModuleConfig, PluginGetAction, PluginWriteAction, PluginDeleteAction, PluginDeletePropAction, PluginInsertAction, GetResponse } from '../types/plugins';
import { OnAddedFn } from '../types/modifyReadResponse';
/**
 * handleAction is responsible for executing (1) on.before (2) the action provided by the store plugin (3) on.error / on.success (4) optional: onNextStoresSuccess.
 * in any event/hook it's possible for the dev to modify the result & also abort the execution chain, which prevents calling handleAction on the next store as well
 */
export declare function handleAction(args: {
    collectionPath: string;
    docId: string | undefined;
    pluginModuleConfig: PluginModuleConfig;
    pluginAction: PluginGetAction | PluginWriteAction | PluginDeletePropAction | PluginDeleteAction | PluginInsertAction;
    payload: void | PlainObject | PlainObject[] | string | string[];
    eventNameFnsMap: EventNameFnsMap;
    onError: SharedConfig['onError'];
    actionName: Exclude<ActionName, 'stream'>;
    stopExecutionAfterAction: (arg?: boolean | 'revert') => void;
    storeName: string;
}): Promise<void | string | GetResponse | OnAddedFn>;
