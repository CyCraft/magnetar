export function isEven (number: number): boolean { return number % 2 === 0 } // prettier-ignore

export function isOdd (number: number): boolean { return number % 2 === 1 } // prettier-ignore

export function countCharacter (target: string, regExp: RegExp): number {
  return (target.match(regExp) || []).length
}
