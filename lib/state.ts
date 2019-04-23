export const assoc = <T extends object, K extends keyof T>(
  object: T,
  key: K,
  value: T[K],
): T => {
  const result = Object.assign({}, object)
  result[key] = value
  return result
}

export const modify = <T extends object, K extends keyof T>(
  object: T,
  key: K,
  fn: (value: T[K]) => T[K],
): T => {
  const result = Object.assign({}, object)
  result[key] = fn(result[key])
  return result
}

export const merge = <T extends object>(
  object: T,
  ...others: Partial<T>[]
): T => Object.assign({}, object, ...others)
