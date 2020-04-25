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

    describe('with parametric type', () => {
      onWorkspace('should connect matching types', workspace => {
        const compare = workspace.newBlock('compare')
        const number = workspace.newBlock('math_number')
        const otherNumber = workspace.newBlock('math_number')
        connect(compare, number, 0)
        connect(compare, otherNumber, 1)
        assertConnection(compare, number)
        assertConnection(compare, otherNumber)
      })

      onWorkspace('should not connect not matching types', workspace => {
        const compare = workspace.newBlock('compare')
        const number = workspace.newBlock('math_number')
        const text = workspace.newBlock('text')
        connect(compare, number, 0)
        connect(compare, text, 1)
        assertConnection(compare, number)
        assertRejectedConnection(compare, text)
      })

      onWorkspace('should connect expected parameters applied functions', workspace => {
        const length = workspace.newBlock('length')
        const id = workspace.newBlock('id')
        const text = workspace.newBlock('text')
  
        connect(id, text)
        connect(length, id)
  
        assertConnection(length, id)
      })

      onWorkspace('should not connect unexpected parameters functions', workspace => {
        const not = workspace.newBlock('not')
        const id = workspace.newBlock('id')
  
        connect(not, id)
  
        assertRejectedConnection(not, id)
      })

      onWorkspace('should not connect unexpected parameters applied functions', workspace => {
        const not = workspace.newBlock('not')
        const id = workspace.newBlock('id')
        const text = workspace.newBlock('text')
  
        connect(id, text)
        connect(not, id)
  
        assertRejectedConnection(not, id)
      })
      
      onWorkspace('should connect advanced matching types', workspace => {
        const compare = workspace.newBlock('compare')
        const id = workspace.newBlock('id')
        const number = workspace.newBlock('math_number')
        const otherId = workspace.newBlock('id')
        const otherNumber = workspace.newBlock('math_number')
        connect(id, number)
        connect(otherId, otherNumber)
        connect(compare, id, 0)
        connect(compare, otherId, 1)
        assertConnection(compare, id)
        assertConnection(compare, otherId)
      })

      onWorkspace('should not connect advanced not matching types', workspace => {
        const compare = workspace.newBlock('compare')
        const id = workspace.newBlock('id')
        const number = workspace.newBlock('math_number')
        const otherId = workspace.newBlock('id')
        const text = workspace.newBlock('text')
        connect(id, number)
        connect(otherId, text)
        connect(compare, id, 0)
        connect(compare, otherId, 1)
        assertRejectedConnection(compare, id)
        assertConnection(compare, otherId)
      })
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

    onWorkspace('should not connect non compositionable two params functions', workspace => {
      const composition = workspace.newBlock('composition')
      const not = workspace.newBlock('not')
      const compare = workspace.newBlock('compare')

      connect(composition, not, 0)
      connect(composition, compare, 1)

      assertRejectedConnection(composition, not)
      assertRejectedConnection(composition, compare)
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

    describe('with partial application functions', () => {

      onWorkspace('should connect compositionable functions', workspace => {
        const composition = workspace.newBlock('composition')
        const charAt = workspace.newBlock('charAt')
        const length = workspace.newBlock('length')

        connect(composition, charAt, 0)
        connect(composition, length, 1)

        assertConnection(composition, charAt)
        assertConnection(composition, length)
      })

      onWorkspace('should connect compositionable two params functions with first param applied', workspace => {
        const composition = workspace.newBlock('composition')
        const not = workspace.newBlock('not')
        const compare = workspace.newBlock('compare')
        const number = workspace.newBlock('math_number')

        connect(compare, number, 0)
        connect(composition, not, 0)
        connect(composition, compare, 1)

        assertConnection(composition, not)
        assertConnection(composition, compare)
      })

      onWorkspace('should connect compositionable two params functions with second param applied', workspace => {
        const composition = workspace.newBlock('composition')
        const not = workspace.newBlock('not')
        const compare = workspace.newBlock('compare')
        const number = workspace.newBlock('math_number')

        connect(compare, number, 1)
        connect(composition, not, 0)
        connect(composition, compare, 1)

        assertConnection(composition, not)
        assertConnection(composition, compare)
      })

      onWorkspace('should not connect non compositionable functions', workspace => {
        const composition = workspace.newBlock('composition')
        const charAt = workspace.newBlock('charAt')
        const length = workspace.newBlock('length')
        const number = workspace.newBlock('math_number')

        connect(charAt, number, 0)
        connect(composition, charAt, 0)
        connect(composition, length, 1)

        assertRejectedConnection(composition, charAt)
        assertRejectedConnection(composition, length)
      })

      onWorkspace('should connect expected value', workspace => {
        const composition = workspace.newBlock('composition')
        const charAt = workspace.newBlock('charAt')
        const number = workspace.newBlock('math_number')
        const text = workspace.newBlock('text')

        connect(charAt, number, 0)
        connect(composition, charAt, 1)
        connect(composition, text, 2)

        assertConnection(composition, text)
      })

      onWorkspace('should not connect unexpected value', workspace => {
        const composition = workspace.newBlock('composition')
        const charAt = workspace.newBlock('charAt')
        const number = workspace.newBlock('math_number')
        const otherNumber = workspace.newBlock('math_number')

        connect(charAt, number, 0)
        connect(composition, charAt, 1)
        connect(composition, otherNumber, 2)

        assertRejectedConnection(composition, otherNumber)
      })

    })
  })
})

const assertConnection = (parentBlock, block) => {
  assert.include(parentBlock.getChildren(), block)
}

const assertRejectedConnection = (parentBlock, block) => {
  assert.notInclude(parentBlock.getChildren(), block)
}