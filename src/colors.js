const defaultColor = 360 / 5 //72

const colorTypes = {
  'Boolean': 360 / 5 * 2, //144
  'Number': 360 / 5 * 3, //216
  'String': 360 / 5 * 4, //288
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
  if (block.getParent()) return colorShow(block.getParent())
  return colorType(block)
}

const combineColors = (colorsList) => {
  var output = 0 
    for(var i=1 ; i <= colorsList.length ; i++){
      output = output + colorsList[i-1]*i
     }
    return output % 360
}