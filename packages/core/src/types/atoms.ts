export type PlainObject = { [key: string]: any }

export type StoreName = string

export type DocMetadata = { data: PlainObject; id: string; exists: boolean; metadata?: PlainObject }
