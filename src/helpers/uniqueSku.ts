export const validateUniqueSKU = (items: any) => {
  if (!items) return

  const seen = new Set()

  for (const item of items) {
    const { sku, raw_item } = item

    if (seen.has(sku || raw_item)) {
      return false
    }

    seen.add(sku || raw_item)
  }

  return true
}
