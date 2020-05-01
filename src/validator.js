function bump(block) {
  block.outputConnection.disconnect()
  block.bumpNeighbours()
}

function checkType(block) {
  try {
    blockType(block)
  } catch {
    const [...children] = block.getChildren()
    children.forEach(bump)
  }
}

function checkParentConnection(block) {
  block.getParent() && checkType(block.getParent())
}
