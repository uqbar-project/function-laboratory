function bump(block) {
  block.outputConnection.disconnect()
  block.bumpNeighbours()
}

function checkInputConnection(input) {
  const targetBlock = input.connection.targetConnection.getSourceBlock()
  try {
    const inputType = getInputType(input)
    const targetType = blockType(targetBlock)
    const result = solveConstraints({ constraints: inputType.eqConstraints(targetType) })
    if (result.error) { bump(targetBlock) }
  } catch {
    bump(targetBlock)
  }
}

function checkType(block) {
  checkInputConnection(block.outputConnection.targetConnection.getParentInput())
}

function checkParentConnection(block) {
  block.getParent() && checkType(block)
}
