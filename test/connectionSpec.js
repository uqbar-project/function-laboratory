'use strict'

describe('Connections', () => {

  describe('Functions', () => {

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


  describe('Composition', () => {

    onWorkspace('should connect functions in first input', workspace => {
      const composition = workspace.newBlock('composition')
      const even = workspace.newBlock('even')

      connect(composition, even, 0)

      assertConnection(composition, even)
    })

    onWorkspace('should connect functions in second input', workspace => {
      const composition = workspace.newBlock('composition')
      const even = workspace.newBlock('even')

      connect(composition, even, 1)

      assertConnection(composition, even)
    })

    onWorkspace('should connect any block in third input', workspace => {
      const composition = workspace.newBlock('composition')
      const number = workspace.newBlock('math_number')

      connect(composition, number, 2)

      assertConnection(composition, number)
    })

    onWorkspace('should not connect non functions in first input', workspace => {
      const composition = workspace.newBlock('composition')
      const number = workspace.newBlock('math_number')

      connect(composition, number, 0)

      assertRejectedConnection(composition, number)
    })

    onWorkspace('should not connect non functions in second input', workspace => {
      const composition = workspace.newBlock('composition')
      const number = workspace.newBlock('math_number')

      connect(composition, number, 1)

      assertRejectedConnection(composition, number)
    })
    
    onWorkspace('should connect compositionable functions', workspace => {
      const composition = workspace.newBlock('composition')
      const not = workspace.newBlock('not')
      const even = workspace.newBlock('even')

      connect(composition, not, 0)
      connect(composition, even, 1)

      assertConnection(composition, even)
      assertConnection(composition, not)
    })

    onWorkspace('should not connect non compositionable functions', workspace => {
      const composition = workspace.newBlock('composition')
      const even = workspace.newBlock('even')
      const not = workspace.newBlock('not')

      connect(composition, even, 0)
      connect(composition, not, 1)

      assertRejectedConnection(composition, even)
      assertRejectedConnection(composition, not)
    })

    onWorkspace('should connect expected value', workspace => {
      const composition = workspace.newBlock('composition')
      const not = workspace.newBlock('not')
      const even = workspace.newBlock('even')
      const number = workspace.newBlock('math_number')

      connect(composition, not, 0)
      connect(composition, even, 1)
      connect(composition, number, 2)

      assertConnection(composition, number)
    })

    onWorkspace('should not connect unexpected value', workspace => {
      const composition = workspace.newBlock('composition')
      const not = workspace.newBlock('not')
      const even = workspace.newBlock('even')
      const text = workspace.newBlock('text')

      connect(composition, not, 0)
      connect(composition, even, 1)
      connect(composition, text, 2)

      assertRejectedConnection(composition, text)
    })
  })
})

const assertConnection = (parentBlock, block) => {
  assert.include(parentBlock.getChildren(), block)
}

const assertRejectedConnection = (parentBlock, block) => {
  assert.notInclude(parentBlock.getChildren(), block)
}