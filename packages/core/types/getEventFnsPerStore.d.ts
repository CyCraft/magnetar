import { SharedConfig, EventFnsPerStore } from './types/base';
export default function getEventFnsPerStore(globalConfig: Partial<SharedConfig>, moduleConfig: Partial<SharedConfig>, actionConfig: Partial<SharedConfig>): EventFnsPerStore;
