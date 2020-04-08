import { isOdd, isEven, countCharacter } from './countHelpers'

export function isDocModule (path: string): boolean {
  return isOdd(countCharacter(path, /\//g))
}
export function isCollectionModule (path: string): boolean {
  return isEven(countCharacter(path, /\//g))
}
