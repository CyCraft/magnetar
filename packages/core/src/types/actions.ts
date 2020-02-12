import { plainObject, Config } from './base'

export type ActionName = 'insert' | 'merge' | 'assign' | 'get' | 'stream'

export type ActionType = 'write' | 'read'

export const actionNameTypeMap: { [action in ActionName]: ActionType } = {
  insert: 'write',
  merge: 'write',
  assign: 'write',
  get: 'read',
  stream: 'read',
}

export type ActionConfig = Config

export type PluginAction = <T extends plainObject>(payload: T, actionConfig?: ActionConfig) => Promise<Partial<T>> // prettier-ignore
