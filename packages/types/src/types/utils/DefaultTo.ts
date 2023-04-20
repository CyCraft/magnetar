export type DefaultTo<V, DefaultValue> = [V] extends [never] ? DefaultValue : V
