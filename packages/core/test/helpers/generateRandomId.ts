export function generateRandomId (): string {
  const genPart = () => String(Math.random()).slice(3, 6)
  return genPart() + genPart() + genPart()
}
