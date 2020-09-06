import { O } from 'ts-toolbelt';
import { ActionName } from '../types/actions';
import { ActionType, ActionTernary } from '../types/actionsInternal';
import { ModuleConfig, GlobalConfig } from '../types/config';
import { CollectionFn, DocFn } from '../VueSync';
export declare function handleActionPerStore<TActionName extends Exclude<ActionName, 'stream'>>([collectionPath, _docId]: [string, string | undefined], moduleConfig: ModuleConfig, globalConfig: O.Compulsory<GlobalConfig>, actionName: TActionName, actionType: ActionType, docFn: DocFn, // actions executed on a "doc" will always return `doc()`
collectionFn?: CollectionFn): ActionTernary<TActionName>;
