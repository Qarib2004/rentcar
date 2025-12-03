type Serializable = Record<string, unknown> | undefined

const sortObject = (value: Serializable): Serializable => {
  if (!value) return value

  return Object.keys(value)
    .sort()
    .reduce<Record<string, unknown>>((acc, key) => {
      const current = value[key]
      if (current && typeof current === 'object' && !Array.isArray(current)) {
        acc[key] = sortObject(current as Record<string, unknown>) ?? current
      } else {
        acc[key] = current
      }
      return acc
    }, {})
}

export const serializeQueryParams = (params?: Serializable) => {
  if (!params) return 'default'
  return JSON.stringify(sortObject(params))
}

