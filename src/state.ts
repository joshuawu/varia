export const assoc = <T extends object, K extends keyof T>(
  object: T,
  key: K,
  value: T[K],
): T => {
  const result = Object.assign({}, object)
  result[key] = value
  return result
}
