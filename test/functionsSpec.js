'use strict'

const assert = chai.assert

describe('Applying parameters', () => {

  describe('One parameter functions', () => {

    onWorkspace('should connect expected parameters value', workspace => {
      const even = workspace.newBlock('even')
      const zero = workspace.newBlock('math_number')

      connect(even, zero)

      assertConnection(even, zero)
    })

    onWorkspace('should not connect unexpected parameters value', workspace => {
      const even = workspace.newBlock('even')
      const emptyString = workspace.newBlock('text')

      connect(even, emptyString)

      assertRejectedConnection(even, emptyString)
    })

    onWorkspace('should connect expected parameters applied functions', workspace => {
      const not = workspace.newBlock('not')
      const even = workspace.newBlock('even')
      const number = workspace.newBlock('math_number')

      connect(even, number)
      connect(not, even)

      assertConnection(not, even)
    })

    onWorkspace('should not connect unexpected parameters functions', workspace => {
      const not = workspace.newBlock('not')
      const even = workspace.newBlock('even')

      connect(not, even)

      assertRejectedConnection(not, even)
    })

  })
})

const assertConnection = (parentBlock, block) => {
  assert.include(parentBlock.getChildren(), block)
}

const assertRejectedConnection = (parentBlock, block) => {
  assert.notInclude(parentBlock.getChildren(), block)
}

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