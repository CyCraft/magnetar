import { ActionName } from '../types/actions';
import { PlainObject, EventNameFnsMap, SharedConfig } from '../types/base';
import { O } from 'ts-toolbelt';
import { PluginAction, PluginActionConfig } from '../types/plugins';
export declare function handleAction<Payload extends PlainObject>(args: {
    pluginAction: PluginAction;
    pluginActionConfig: PluginActionConfig;
    payload: Payload;
    eventNameFnsMap: O.Compulsory<EventNameFnsMap>;
    onError: SharedConfig['onError'];
    actionName: ActionName;
    stopExecutionAfterAction: (arg?: boolean | 'revert') => void;
}): Promise<Partial<Payload>>;
