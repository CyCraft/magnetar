import { plainObject, PluginAction, ActionConfig } from '../types/actions';
export declare function handleAction<Payload extends plainObject>(args: {
    pluginAction: PluginAction;
    payload: Payload;
    actionConfig: ActionConfig;
    storeName: string;
    wasAborted: () => void;
}): Promise<Partial<Payload>>;
