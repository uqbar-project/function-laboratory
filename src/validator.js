function checkInputType(input, block) {
  const expectedType = getInputType(input)
  const actualType = blockType(block)
  const types = [expectedType, actualType]
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
  return input && matchTypes(getInputType(input), outputFunctionType(block2))
}

function matchApplyType(block1, block2) {
  const input = firstEmptyInput(block1)
  return input && matchTypes(getInputType(input), blockType(block2))
}

function checkParentConnection(block) {
  if (block.outputConnection.targetConnection && !checkInputType(block.outputConnection.targetConnection.getParentInput(), block)) {
    bump(block)
  }
}

function checkFunction(functionBlock) {
  if (!isFunction(blockType(functionBlock))) {
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