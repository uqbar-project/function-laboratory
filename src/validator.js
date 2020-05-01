
function checkConnectionType(connection, block, getType = functionType) {
  return connection.checkType({ check_: [getType(block)] })
}

function checkInputType(input, block) {
  const inputType = getInputType(input)
  const blockType = functionType(block)
  const types = [inputType, blockType]
  return !types.includes('Error') && (types.includes('Any') || matchTypes(...types))
}

function matchTypes(inputType, blockType) {
  return structuralMatch(inputType, blockType) && //TODO: compare by structural for higher order
    (isVarType(inputType) || isVarType(blockType) || inputType == blockType)
}

function structuralMatch(inputType, blockType) {
  return functionTypeToList(inputType).length === functionTypeToList(blockType).length
}

function bump(block) {
  block.outputConnection.disconnect()
  block.bumpNeighbours()
}

function firstEmptyInput(block) {
  return block.inputList.filter(isEmptyBlockInput)[0]
}

function matchCompositionType(block1, block2) {
  const input = firstEmptyInput(block1)
  return input && checkConnectionType(input.connection, block2, outputFunctionType)
}

function matchApplyType(block1, block2) {
  const input = firstEmptyInput(block1)
  return input && checkConnectionType(input.connection, block2)
}

function checkParentConnection(block) {
  if (block.outputConnection.targetConnection && !checkInputType(block.outputConnection.targetConnection.getParentInput(), block)) {
    bump(block)
  }
}

function checkFunction(functionBlock) {
  if (!isFunction(functionType(functionBlock))) {
    bump(functionBlock)
  }
}

function checkComposition(block1, block2) {
  if (!matchCompositionType(block1, block2)) {
    bump(block1)
    bump(block2)
  }
}

function checkCompositionParam(param) {
  if (param) {
    checkFunction(param)
  }
}

function checkApply(block1, block2) {
  if (!matchApplyType(block1, block2)) {
    bump(block2)
  }
}