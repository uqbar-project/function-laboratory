'use strict'

const assert = chai.assert

const onWorkspace = (name, test) => {
  var workspace = new Blockly.Workspace()
  it(name, () => {
    try {
      test(workspace)
    } finally {
      workspace.dispose()
    }
  })
}

describe('Applying parameters', () => {
  describe('One parameter functions', () => {
    describe('even', () => {

      onWorkspace('should be possible to apply numbers to it', workspace => {
        const even = workspace.newBlock('even')
        const zero = workspace.newBlock('math_number')

        connect(even, zero)

        assert.include(even.getChildren(), zero)
      })

      onWorkspace('should not be possible to apply strings to it', workspace => {
        const even = workspace.newBlock('even')
        const emptyString = workspace.newBlock('text')

        connect(even, emptyString)

        assert.notInclude(even.getChildren(), emptyString)
      })
    })
  })
})

const connect = (block, parameterBlock) => {
  tryConnect(block, parameterBlock)
  forceBlocklyEvents()
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