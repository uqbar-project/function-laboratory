'use strict'

describe('Function connections', () => {

  describe('Simple', () => {

    onWorkspace('should connect expected parameters value', workspace => {
      const even = workspace.newBlock('even')
      const zero = workspace.newBlock('math_number')

      connect(even, zero)

      assertConnection(even, zero)
      assertType(even, 'Boolean')
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
        
        assertRejectedConnection(compare, otherId)
      })
    })
  })

  describe('Apply', () => {
    onWorkspace('should connect functions in first input', workspace => {
      const apply = workspace.newBlock('apply')
      const even = workspace.newBlock('even')

      connect(apply, even, 0)

      assertConnection(apply, even)
    })

    onWorkspace('should not connect non-functions in first input', workspace => {
      const apply = workspace.newBlock('apply')
      const emptyString = workspace.newBlock('text')

      connect(apply, emptyString, 0)

      assertRejectedConnection(apply, emptyString)
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

      assertRejectedConnection(composition, not)
    })

    onWorkspace('should not connect non compositionable two params functions', workspace => {
      const composition = workspace.newBlock('composition')
      const not = workspace.newBlock('not')
      const compare = workspace.newBlock('compare')

      connect(composition, not, 0)
      connect(composition, compare, 1)

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

      onWorkspace('should connect nested compositionable composition with function', workspace => {
        const outerComposition = workspace.newBlock('composition')
        const innerComposition = workspace.newBlock('composition')
        const not = workspace.newBlock('not')
        const anotherNot = workspace.newBlock('not')
        const even = workspace.newBlock('even')

        // (not . not) . even

        connect(innerComposition, not, 0)
        connect(innerComposition, anotherNot, 1)
        connect(outerComposition, innerComposition, 0)
        connect(outerComposition, even, 1)

        assertConnection(innerComposition, not)
        assertConnection(innerComposition, anotherNot)

        assertConnection(outerComposition, innerComposition)
        assertConnection(outerComposition, even)
      })

      onWorkspace('should not connect nested composition with function when they are not composable', workspace => {
        const outerComposition = workspace.newBlock('composition')
        const innerComposition = workspace.newBlock('composition')
        const not = workspace.newBlock('not')
        const anotherNot = workspace.newBlock('not')
        const length = workspace.newBlock('length')

        // (not . not) . length

        connect(innerComposition, not, 0)
        connect(innerComposition, anotherNot, 1)
        connect(outerComposition, innerComposition, 0)
        connect(outerComposition, length, 1)

        assertRejectedConnection(outerComposition, length)
      })

      onWorkspace('should connect 2 nested compositions that are composable', workspace => {
        const outerComposition = workspace.newBlock('composition')
        const innerInputComposition = workspace.newBlock('composition')
        const innerOutputComposition = workspace.newBlock('composition')
        const not = workspace.newBlock('not')
        const anotherNot = workspace.newBlock('not')
        const even = workspace.newBlock('even')
        const length = workspace.newBlock('length')

        connect(innerInputComposition, even, 0)
        connect(innerInputComposition, length, 1)
        connect(innerOutputComposition, not, 0)
        connect(innerOutputComposition, anotherNot, 1)
        connect(outerComposition, innerOutputComposition, 0)
        connect(outerComposition, innerInputComposition, 1)

        // (not . not) . (even . length)

        assertConnection(outerComposition, innerInputComposition)
        assertConnection(outerComposition, innerOutputComposition)
      })

      onWorkspace('should not connect 2 nested compositions that are not composable', workspace => {
        const outerComposition = workspace.newBlock('composition')
        const innerInputComposition = workspace.newBlock('composition')
        const innerOutputComposition = workspace.newBlock('composition')
        const not = workspace.newBlock('not')
        const even = workspace.newBlock('even')
        const anotherEven = workspace.newBlock('even')
        const length = workspace.newBlock('length')

        // (not . even) . (even . length)

        connect(innerInputComposition, even, 0)
        connect(innerInputComposition, length, 1)
        connect(innerOutputComposition, not, 0)
        connect(innerOutputComposition, anotherEven, 1)
        connect(outerComposition, innerOutputComposition, 0)
        connect(outerComposition, innerInputComposition, 1)

        assertRejectedConnection(outerComposition, innerInputComposition)
      })

      onWorkspace('should connect functions that use parametric types that collide with the composition parametric types when they are composable', workspace => {
        const composition = workspace.newBlock('composition')
        const id = workspace.newBlock('id')
        const even = workspace.newBlock('even')
        const zero = workspace.newBlock('math_number')

        // id . even $ 0

        connect(composition, id, 0)
        connect(composition, even, 1)
        connect(composition, zero, 2)

        assertConnection(composition, id)
        assertConnection(composition, even)
        assertConnection(composition, zero)
      })

      onWorkspace('should not connect functions that use parametric types that collide with the composition parametric types when they are not composable', workspace => {
        const composition = workspace.newBlock('composition')
        const id = workspace.newBlock('id')
        const not = workspace.newBlock('not')
        const zero = workspace.newBlock('math_number')

        // not . id $ 0

        connect(composition, not, 0)
        connect(composition, id, 1)
        connect(composition, zero, 2)

        assertRejectedConnection(composition, zero)
      })

      onWorkspace('should compose 2 unapplied compositions', workspace => {
        const composition = workspace.newBlock('composition')
        const inputComposition = workspace.newBlock('composition')
        const outputComposition = workspace.newBlock('composition')

        // (.) . (.)

        connect(composition, outputComposition, 0)
        connect(composition, inputComposition, 1)

        assertConnection(composition, outputComposition)
        assertConnection(composition, inputComposition)
      })

    })
  })

  describe('Rejections', () => {
    describe('should be on last connected block', () => {

      onWorkspace('first argument', workspace => {
        const composition = workspace.newBlock('composition')
        const length = workspace.newBlock('length')
        const even = workspace.newBlock('even')
        const number = workspace.newBlock('math_number')

        connect(composition, even, 1)
        connect(composition, number, 2)
        connect(composition, length, 0)

        assertConnection(composition, even)
        assertConnection(composition, number)
        assertRejectedConnection(composition, length)
      })

      onWorkspace('second argument', workspace => {
        const composition = workspace.newBlock('composition')
        const length = workspace.newBlock('length')
        const even = workspace.newBlock('even')
        const number = workspace.newBlock('math_number')

        connect(composition, length, 0)
        connect(composition, number, 2)
        connect(composition, even, 1)

        assertConnection(composition, length)
        assertConnection(composition, number)
        assertRejectedConnection(composition, even)
      })

      onWorkspace('third argument', workspace => {
        const composition = workspace.newBlock('composition')
        const length = workspace.newBlock('length')
        const even = workspace.newBlock('even')
        const number = workspace.newBlock('math_number')

        connect(composition, even, 0)
        connect(composition, length, 1)
        connect(composition, number, 2)

        assertConnection(composition, even)
        assertConnection(composition, length)
        assertRejectedConnection(composition, number)
      })
    })

  })

})
