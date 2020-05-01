const defaultColor = 0
const typeColors = {
  'Boolean': 20,
  'Number': 60,
  'String': 160,
  'Any': defaultColor
}

const colorType = (block) => typeToColor(functionType(block))

const typeToColor = (type) => {
  if (isFunction(type)) return interpolateColors(functionTypeToList(type))
  if (isVarType(type)) return defaultColor
  return typeColors[type] || defaultColor
}

const interpolateColors = (types) => types.map(typeToColor).reduce((c1, c2) => c1 + c2, 0)

const colorShow = (block) => {
  if (block.getParent()) return colorType(block.getParent())
  return colorType(block)
}