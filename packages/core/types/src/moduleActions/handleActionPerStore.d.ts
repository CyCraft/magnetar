import { O } from 'ts-toolbelt';
import { ActionType, ActionName, ActionTernary } from '../types/actions';
import { ModuleConfig, GlobalConfig } from '../types/base';
import { CollectionFn, DocFn } from '..';
export declare function handleActionPerStore<TActionName extends Exclude<ActionName, 'stream'>>(modulePath: string, moduleConfig: ModuleConfig, globalConfig: O.Compulsory<GlobalConfig>, actionName: TActionName, actionType: ActionType, docFn: DocFn, // actions executed on a "doc" will always return `doc()`
collectionFn?: CollectionFn): ActionTernary<TActionName>;
