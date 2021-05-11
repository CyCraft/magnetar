export type StoreName = string

export type DocMetadata = {
  data: Record<string, any>
  id: string
  /**
   * In case the doc was pulled from cache with `fetch({ ifUnfetched: true })` then `exists` will be `'unknown'`
   */
  exists: boolean | 'unknown'
  /**
   * In case the doc was pulled from cache with `fetch({ ifUnfetched: true })` then `metadata` will be absent
   */
  metadata?: Record<string, any>
}
