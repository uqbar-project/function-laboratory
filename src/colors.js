const defaultColor = 0

const colorTypes = {
  'Boolean': 20,
  'Number': 60,
  'String': 160,
  'Any': defaultColor
}

const colorType = (block) => {
  try { return typeToColor(blockType(block)) }
  catch { return defaultColor }
}

const typeToColor = type => type.toColor(colorTypes)

const colorShow = (block) => {
  if (block.getParent()) return colorType(block.getParent())
  return colorType(block)
}
