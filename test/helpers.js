'use strict'

const assert = chai.assert

const blocklyWorkspaceMock = function () {
  let workspace = new Blockly.WorkspaceSvg({})
  workspace.createDom()
  workspace.cachedParentSvg_ = { getScreenCTM: () => { } }
  Blockly.mainWorkspace = workspace
  workspace.highlightBlock = () => { } //TODO: Use sinon
  return workspace
}

const onWorkspace = (name, test) => {
  var workspace = blocklyWorkspaceMock()
  it(name, () => {
    try {
      test(workspace)
    } finally {
      workspace.dispose()
    }
  })
}



const connect = (block, parameterBlock, inputIndex = 0) => {
  tryConnect(block, parameterBlock, inputIndex)
  forceBlocklyEvents()
  forceBlocklyEvents() // ??
}

const tryConnect = (block, parameterBlock, inputIndex = 0) => {
  try {
    block.inputList[inputIndex].connection.connect(parameterBlock.outputConnection)
  } catch { }
}

// This forces synchronous onchange() calls.
function forceBlocklyEvents() {
  Blockly.Events.fireNow_()
}