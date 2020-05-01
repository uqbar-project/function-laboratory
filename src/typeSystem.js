const isFunction = type => type.includes("->")

const isVarType = type => type == type.toLowerCase()

const asFunctionType = (...types) => types.join('->')

const functionTypeToList = functionType => functionType.split('->')

function functionType(functionBlock) {
  const inputTypes = functionBlock.inputList
    .filter(isEmptyBlockInput)
    .map(input => getInputType(input))
  return asFunctionType(...inputTypes, getOutputType(functionBlock))
}

function outputFunctionType(functionBlock) {
  const type = functionType(functionBlock)
  if (!isFunction(type)) return null
  return asFunctionType(...functionTypeToList(type).slice(1))
}

function typeVariables(functionBlock) {
  const typeMap = {}
  functionBlock.inputList
    .filter(isFullyBlockInput)
    .filter(input => input.parametricType)
    .forEach(input => {
      const typeVar = input.parametricType
      const type = functionType(input.connection.targetConnection.getSourceBlock())
      if (type != 'Any') {
        typeMap[typeVar] = typeMap[typeVar] && typeMap[typeVar] != type ? 'ERROR' : type  //TODO: Type check? 
      }
    })
  return typeMap
}

function getInputType(input) {
  if (input.parametricType) {
    const typeMap = typeVariables(input.getSourceBlock())
    return typeMap[input.parametricType] || input.parametricType
  }

  return getType(input.connection)
}

function getOutputType(block) {
  if (block.parametricType) {
    const typeMap = typeVariables(block)
    return typeMap[block.parametricType] || block.parametricType
  }

  return getType(block.outputConnection)
}

function getType(connection) {
  return connection.getCheck() && connection.getCheck()[0] || 'Any'
}
