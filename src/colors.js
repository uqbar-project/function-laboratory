const typeColors = {
  'Boolean': '20',
  'Number': '60',
  'String': '160',
}
const typeToColor = (type) => {
  if (isFunction(type)) return 'gray'
  if (isVarType(type)) return 'white'
  return typeColors[type] || 'white'
}