import { Config, EventFnsPerStore } from './types/base';
export default function getEventFnsPerStore(globalConfig: Partial<Config>, moduleConfig: Partial<Config>, actionConfig: Partial<Config>): EventFnsPerStore;
