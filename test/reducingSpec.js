'use strict'

describe('Reducing expressions', () => {
  onWorkspace('reducing an unapplied function fails and keeps it in the workspace', workspace => {
    const even = workspace.newBlock('even')

    assert.throws(() => even.reduce())

    assertAnyBlockInWorkspaceSatisfies(workspace, ({ type }) => type == 'even')
  })

  onWorkspace('reducing an applied function removes it and its parameter from workspace and adds result to workspace', workspace => {
    const even0 = newFunction(workspace, 'even', newNumber(workspace, 0))

    even0.reduce()

    assertBlockWithTypeDoesNotExistInWorkspace(workspace, 'even')
    assertBlockWithTypeDoesNotExistInWorkspace(workspace, 'math_number')
    assertEqualBlocksInWorkspace(workspace, newBoolean(workspace, true))
  })

  onWorkspace('reducing applied function works for expresion arguments', workspace => {
    const notEven0 = newFunction(workspace, 'not',
      newFunction(workspace, 'even', newNumber(workspace, 0))
    )

    notEven0.reduce()

    assertBlockWithTypeDoesNotExistInWorkspace(workspace, 'not')
    assertBlockWithTypeDoesNotExistInWorkspace(workspace, 'even')
    assertBlockWithTypeDoesNotExistInWorkspace(workspace, 'math_number')
    assertEqualBlocksInWorkspace(workspace, newBoolean(workspace, false))
  })

  onWorkspace('reducing partial applied function arguments', workspace => {
    const charAt0 = newFunction(workspace, 'charAt', newNumber(workspace, 0))
    const legthCharAt0ASD = newFunction(workspace, 'composition',
      newFunction(workspace, 'length'), charAt0, newString(workspace, "ASD")
    )

    legthCharAt0ASD.reduce()

    assertBlockWithTypeDoesNotExistInWorkspace(workspace, 'composition')
    assertBlockWithTypeDoesNotExistInWorkspace(workspace, 'length')
    assertBlockWithTypeDoesNotExistInWorkspace(workspace, 'charAt')
    assertBlockWithTypeDoesNotExistInWorkspace(workspace, 'text')
    assertEqualBlocksInWorkspace(workspace, newNumber(workspace, 1))
  })

  onWorkspace('reducing positional partial applied function arguments', workspace => {
    const charAtASD = newFunction(workspace, 'charAt', undefined, newString(workspace, "ASD"))
    const legthCharAt0ASD = newFunction(workspace, 'composition',
      newFunction(workspace, 'length'), charAtASD, newNumber(workspace, 0)
    )

    legthCharAt0ASD.reduce()

    assertBlockWithTypeDoesNotExistInWorkspace(workspace, 'composition')
    assertBlockWithTypeDoesNotExistInWorkspace(workspace, 'length')
    assertBlockWithTypeDoesNotExistInWorkspace(workspace, 'charAt')
    assertBlockWithTypeDoesNotExistInWorkspace(workspace, 'text')
    assertEqualBlocksInWorkspace(workspace, newNumber(workspace, 1))
  })

  describe('Reduction results', () => {
    describe('even', () => {
      onWorkspace('When it is applied an even number it reduces to true', workspace => {
        const even0 = newFunction(workspace, 'even', newNumber(workspace, 0))
        assertEqualReductionBlock(even0, newBoolean(workspace, true))
      })

      onWorkspace('When it applied an odd number it reduces to false', workspace => {
        const even1 = newFunction(workspace, 'even', newNumber(workspace, 1))
        assertEqualReductionBlock(even1, newBoolean(workspace, false))
      })
    })

    describe('not', () => {
      onWorkspace('When it is applied true it reduces to false', workspace => {
        const notTrue = newFunction(workspace, 'not', newBoolean(workspace, true))
        assertEqualReductionBlock(notTrue, newBoolean(workspace, false))
      })

      onWorkspace('When it is applied false it reduces to true', workspace => {
        const notFalse = newFunction(workspace, 'not', newBoolean(workspace, false))
        assertEqualReductionBlock(notFalse, newBoolean(workspace, true))
      })
    })

    describe('length', () => {
      onWorkspace('when it is applied an empty string it reduces to 0', workspace => {
        const lengthEmpty = newFunction(workspace, 'length', newString(workspace, ""))
        assertEqualReductionBlock(lengthEmpty, newNumber(workspace, 0))
      })

      onWorkspace('when it is applied a string it reduces to the amount of characters in the string', workspace => {
        const lengthHelloWorld = newFunction(workspace, 'length', newString(workspace, "Hello World!"))
        assertEqualReductionBlock(lengthHelloWorld, newNumber(workspace, 12))
      })
    })

    describe("charAt", () => {
      onWorkspace("when it is passed a valid position of an string and a string, it returns the character at that position", workspace => {
        const charAt0Hello = newFunction(workspace, 'charAt',
          newNumber(workspace, 0), newString(workspace, "Hello")
        )
        assertEqualReductionBlock(charAt0Hello, newString(workspace, "H"))
      })

      onWorkspace("when it is passed an invalid position of an string and a string, it fails without reducing anything", workspace => {
        const six = newNumber(workspace, 6)
        const hello = newString(workspace, "Hello")
        const charAt0Hello = newFunction(workspace, 'charAt', six, hello)

        charAt0Hello.reduce()

        assert.exists(workspace.getBlockById(charAt0Hello.id))
        assert.exists(workspace.getBlockById(hello.id))
        assert.exists(workspace.getBlockById(six.id))
      })
    })

    describe('id', () => {
      onWorkspace('when it is applied any paramter it reduces to that parameter', workspace => {
        const id0 = newFunction(workspace, 'id', newNumber(workspace, 0))
        assertEqualReductionBlock(id0, newNumber(workspace, 0))
      })
    })

    describe('composition', () => {
      onWorkspace('reduction works', workspace => {
        const odd0 = newFunction(workspace, 'composition',
          newFunction(workspace, 'not'), newFunction(workspace, 'even'), newNumber(workspace, 0)
        )
        assertEqualReductionBlock(odd0, newBoolean(workspace, false))
      })
    })

    describe('any', () => {
      onWorkspace('on empty list', workspace => {
        const anyEvenEmpty = newFunction(workspace, 'any',
          newFunction(workspace, 'even'), newList(workspace, [])
        )
        assertEqualReductionBlock(anyEvenEmpty, newBoolean(workspace, false))
      })

      onWorkspace('When any element apply', workspace => {
        const numbers = [1, 2].map(n => newNumber(workspace, n))
        const anyEven12 = newFunction(workspace, 'any',
          newFunction(workspace, 'even'), newList(workspace, numbers)
        )
        assertEqualReductionBlock(anyEven12, newBoolean(workspace, true))
      })

      onWorkspace('When no element apply', workspace => {
        const numbers = [1, 3].map(n => newNumber(workspace, n))
        const anyEven13 = newFunction(workspace, 'any',
          newFunction(workspace, 'even'), newList(workspace, numbers)
        )
        assertEqualReductionBlock(anyEven13, newBoolean(workspace, false))
      })
    })

    describe('map', () => {
      onWorkspace('reduction works', workspace => {
        const numbers = [1, 3].map(n => newNumber(workspace, n))
        const words = ["a", "asd"].map(s => newString(workspace, s))
        const mapLengthWords = newFunction(workspace, 'map',
          newFunction(workspace, 'length'), newList(workspace, words)
        )
        assertEqualReductionBlock(mapLengthWords, newList(workspace, numbers))
      })
    })

    describe('fold', () => {
      onWorkspace('reduction works', workspace => {
        const numbers = newList(workspace, [1, 2, 3].map(n => newNumber(workspace, n)))
        const zero = newNumber(workspace, 0)
        const add = newBlockWithFields(workspace, "math_arithmetic", { "OP": "ADD" })
        const sumOfOneTwoAndThree = newFunction(workspace, 'fold', add, zero, numbers)

        assertEqualReductionBlock(sumOfOneTwoAndThree, newNumber(workspace, 6))
      })
    })

    describe('convoluted example with multiple parameters and partial application', () => {
      onWorkspace('reduction works', workspace => {
        const numbers = newList(workspace, [1, 2, 3].map(n => newNumber(workspace, n)))
        const zero = newNumber(workspace, 0)
        const fold = newFunction(workspace, 'fold', undefined, undefined, numbers)
        const id = newFunction(workspace, 'id')
        const add = newBlockWithFields(workspace, "math_arithmetic", { "OP": "ADD" })
        const composition = newFunction(workspace, 'composition', fold, id, add)
        const application = newFunction(workspace, 'apply', composition, zero)

        assertEqualReductionBlock(application, newNumber(workspace, 6))
      })
    })
  })
})

const assertBlockWithTypeDoesNotExistInWorkspace = (workspace, type) =>
  assert.isEmpty(workspace.getBlocksByType(type))

const assertAnyBlockInWorkspaceSatisfies = (workspace, condition) => {
  assert.exists(workspace.getAllBlocks().find(condition))
}

const assertEqualBlocksInWorkspace = (workspace, expectedBlock) =>
  assertEqualBlocks(workspace.getTopBlocks()[0], expectedBlock)

const assertEqualReductionBlock = (block, expectedBlock) =>
  assertEqualBlocks(block.getReduction().block, expectedBlock)

const assertEqualBlocks = (block, expectedBlock) => {
  assert.equal(block.type, expectedBlock.type)
  zip(
    block.inputList.flatMap(input => input.fieldRow),
    expectedBlock.inputList.flatMap(input => input.fieldRow)
  ).forEach(([field, expectedField]) => {
    assert.equal(field.name, expectedField.name)
    assert.equal(field.getValue(), expectedField.getValue())
  })
  zip(
    block.getChildren(),
    expectedBlock.getChildren()
  ).forEach(([block, expectedBlock]) => assertEqualBlocks(block, expectedBlock))
}