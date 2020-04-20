export type PlainObject = { [key: string]: any; [key: number]: never }

export type StoreName = string

export type DocMetadata = { data: PlainObject; id: string; exists: boolean; metadata?: PlainObject }
