import { PartialDeep } from './utils/PartialDeep'

/**
 * This function will be executed everytime BEFORE the related action is triggered. The function defined will receive the payload of the action. You can then modify and return this payload.
 */
export type ModifyWritePayload<DocDataType extends Record<string, any> = Record<string, any>> = (
  payload: PartialDeep<DocDataType>,
  docId?: string | void
) => PartialDeep<DocDataType>

/**
 * This function will be executed everytime BEFORE the related action is triggered. The function defined will receive the payload of the action. You can then modify and return this payload.
 */
export type ModifyDeletePropPayload = (payload: string | string[]) => string | string[]

/**
 * This function will be executed everytime BEFORE the related action is triggered. The function defined will receive the payload of the action. You can then modify and return this payload.
 */
export type ModifyReadPayload = (
  payload: Record<string, any> | void,
  docId?: string | void
) => Record<string, any> | void

/**
 * These functions will be executed everytime BEFORE the related action is triggered. The function defined will receive the payload of the action. You can then modify and return this payload.
 */
export type ModifyPayloadFnMap<DocDataType extends Record<string, any> = Record<string, any>> = {
  insert?: ModifyWritePayload<DocDataType>
  merge?: ModifyWritePayload<DocDataType>
  assign?: ModifyWritePayload<DocDataType>
  replace?: ModifyWritePayload<DocDataType>
  write?: ModifyWritePayload<DocDataType>
  deleteProp?: ModifyDeletePropPayload
  read?: ModifyReadPayload
  stream?: ModifyReadPayload
  fetch?: ModifyReadPayload
}

/**
 * These functions will be executed everytime BEFORE the related action is triggered. The function defined will receive the payload of the action. You can then modify and return this payload.
 */
export type ModifyPayloadFnsMap = {
  insert: ModifyWritePayload[]
  merge: ModifyWritePayload[]
  assign: ModifyWritePayload[]
  replace: ModifyWritePayload[]
  write: ModifyWritePayload[]
  deleteProp: ModifyDeletePropPayload[]
  delete: never[]
  read: ModifyReadPayload[]
  stream: ModifyReadPayload[]
  fetch: ModifyReadPayload[]
}
