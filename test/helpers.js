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