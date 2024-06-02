/**
 * Utility type to clean up the final output by removing 'never' properties
 */
export type Clean<T> = {
  [K in keyof T as T[K] extends never ? never : K]: T[K]
}

/**
 * Picks just the fields with number values from an object
 */
export type PickNumbers<T> = Clean<{
  [K in keyof T]: T[K] extends number
    ? T[K]
    : T[K] extends object
      ? Clean<PickNumbers<T[K]>>
      : never
}>
