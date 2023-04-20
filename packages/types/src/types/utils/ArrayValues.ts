export type ArrayValues<T> = T extends (infer K)[] ? K : never
