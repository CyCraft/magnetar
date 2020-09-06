export type StoreName = string

export type DocMetadata = {
  data: Record<string, any>
  id: string
  exists: boolean
  metadata?: Record<string, any>
}
