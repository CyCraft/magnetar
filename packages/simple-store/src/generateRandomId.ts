export function generateRandomId (): string {
  const genPart = (): string => String(Math.random()).slice(3, 6)
  return genPart() + genPart() + genPart()
}
