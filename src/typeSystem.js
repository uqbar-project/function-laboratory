const isFunction = type => type.includes("->")

const isVarType = type => type == type.toLowerCase()

const asFunctionType = (...types) => types.join('->')

const functionTypeToList = functionType => functionType.split('->')

function blockType(functionBlock) {
  const inputTypes = functionBlock.inputList
    .filter(isEmptyBlockInput)
    .map(input => getInputType(input))
  return asFunctionType(...inputTypes, getOutputType(functionBlock))
}

function outputFunctionType(functionBlock) {
  const type = blockType(functionBlock)
  if (!isFunction(type)) return null
  return asFunctionType(...functionTypeToList(type).slice(1))
}

function typeVariables(functionBlock) {
  const typeMap = {}
  functionBlock.inputList
    .filter(isFullyBlockInput)
    .filter(input => input.inputType && isVarType(input.inputType))
    .forEach(input => {
      const typeVar = input.inputType
      const type = blockType(input.connection.targetConnection.getSourceBlock())
      if (type != 'Any') {
        typeMap[typeVar] = typeMap[typeVar] && typeMap[typeVar] != type ? 'ERROR' : type  //TODO: Type check? 
      }
    })
  return typeMap
}

function getInputType(input) {
  if (input.inputType) {
    const typeMap = typeVariables(input.getSourceBlock())
    return typeMap[input.inputType] || input.inputType
  }

  return getType(input.connection)
}

function getOutputType(block) {
  if (block.outputType) {
    const typeMap = typeVariables(block)
    return typeMap[block.outputType] || block.outputType
  }

  return getType(block.outputConnection)
}

function getType(connection) {
  
  return connection.getCheck() && connection.getCheck()[0] || 'Any'
}
