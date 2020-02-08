export type plainObject = { [key: string]: any }

export enum Actions {
  insert = 'insert',
  merge = 'merge',
  assign = 'assign',
  get = 'get',
  stream = 'stream',
}

export type ActionType = 'write' | 'read'

export const actionTypeMap: { [action in Actions]: ActionType } = {
  [Actions.insert]: 'write',
  [Actions.merge]: 'write',
  [Actions.assign]: 'write',
  [Actions.get]: 'read',
  [Actions.stream]: 'read',
}
