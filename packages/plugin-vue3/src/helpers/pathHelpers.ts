import { Vue3StoreModuleConfig } from '../CreatePlugin'

export function parsedCollectionPath(
  collectionPath: string,
  pluginModuleConfig: Vue3StoreModuleConfig
): string {
  const { where, queryBasedCache } = pluginModuleConfig
  return !where || !queryBasedCache ? collectionPath : `${JSON.stringify(where)}${collectionPath}`
}
