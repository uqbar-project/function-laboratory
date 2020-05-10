const defaultColor = 360 / 5

const colorTypes = {
  'Boolean': 360 / 5 * 2,
  'Number': 360 / 5 * 3,
  'String': 360 / 5 * 4,
  'Function': 10,
  'List': 40,
  'Any': defaultColor
}

const colorForType = (name) => colorTypes[name] || defaultColor

const colorType = (block) => {
  try { return typeToColor(blockType(block)) }
  catch { return defaultColor }
}

const typeToColor = type => type.toColor(colorTypes)

const colorShow = (block) => {
  if (block.getParent()) return colorType(block.getParent())
  return colorType(block)
}
