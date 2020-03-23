export function waitMs (ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
