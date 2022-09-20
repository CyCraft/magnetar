export type StoreName = string

export type DocMetadata = {
  data: Record<string, any> | undefined
  id: string
  /**
   * In case the doc was returned optimisticly (from the local store data) then `exists` will be `'unknown'`
   */
  exists: boolean | 'unknown'
  /**
   * In case the doc was returned optimisticly (from the local store data) then `metadata` will be absent
   */
  metadata?: Record<string, any>
}
