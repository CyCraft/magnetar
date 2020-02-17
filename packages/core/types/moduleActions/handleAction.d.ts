import { VueSyncAction, ActionName } from '../types/actions';
import { PlainObject, EventNameFnsMap, Config } from '../types/base';
import { O } from 'ts-toolbelt';
export declare function handleAction<Payload extends PlainObject>(args: {
    pluginAction: VueSyncAction;
    payload: Payload;
    eventNameFnsMap: O.Compulsory<EventNameFnsMap>;
    onError: Config['onError'];
    actionName: ActionName;
    stopExecutionAfterAction: (arg?: boolean | 'revert') => void;
}): Promise<Partial<Payload>>;
