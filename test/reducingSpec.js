'use strict'

describe('Reducing expressions', () => {
  onWorkspace('reducing an unapplied function fails and keeps it in the workspace', workspace => {
    const even = workspace.newBlock('even')

    even.reduce()

    assertErrorReported('Falta aplicar parametros para reducir esta expresion')
    assertAnyBlockInWorkspaceSatisfies(workspace, ({ type }) => type == 'even')
  })

  onWorkspace('reducing an applied function removes it and its parameter from workspace and adds result to workspace', workspace => {
    const even0 = newFunction(workspace, 'even', numberToBlock(workspace, 0))

    even0.reduce()

    assertBlockWithTypeDoesNotExistInWorkspace(workspace, 'even')
    assertBlockWithTypeDoesNotExistInWorkspace(workspace, 'math_number')
    assertEqualBlocksInWorkspace(workspace, booleanToBlock(workspace, true))
  })

  onWorkspace('reducing applied function works for expresion arguments', workspace => {
    const notEven0 = newFunction(workspace, 'not',
      newFunction(workspace, 'even', numberToBlock(workspace, 0))
    )

    notEven0.reduce()

    assertBlockWithTypeDoesNotExistInWorkspace(workspace, 'not')
    assertBlockWithTypeDoesNotExistInWorkspace(workspace, 'even')
    assertBlockWithTypeDoesNotExistInWorkspace(workspace, 'math_number')
    assertEqualBlocksInWorkspace(workspace, booleanToBlock(workspace, false))
  })

  onWorkspace('reducing partial applied function arguments', workspace => {
    const charAt0 = newFunction(workspace, 'charAt', numberToBlock(workspace, 0))
    const legthCharAt0ASD = newFunction(workspace, 'composition',
      newFunction(workspace, 'length'), charAt0, stringToBlock(workspace, "ASD")
    )

    legthCharAt0ASD.reduce()

    assertBlockWithTypeDoesNotExistInWorkspace(workspace, 'composition')
    assertBlockWithTypeDoesNotExistInWorkspace(workspace, 'length')
    assertBlockWithTypeDoesNotExistInWorkspace(workspace, 'charAt')
    assertBlockWithTypeDoesNotExistInWorkspace(workspace, 'text')
    assertEqualBlocksInWorkspace(workspace, numberToBlock(workspace, 1))
  })

  onWorkspace('reducing positional partial applied function arguments', workspace => {
    const charAtASD = newFunction(workspace, 'charAt', undefined, stringToBlock(workspace, "ASD"))
    const legthCharAt0ASD = newFunction(workspace, 'composition',
      newFunction(workspace, 'length'), charAtASD, numberToBlock(workspace, 0)
    )

    legthCharAt0ASD.reduce()

    assertBlockWithTypeDoesNotExistInWorkspace(workspace, 'composition')
    assertBlockWithTypeDoesNotExistInWorkspace(workspace, 'length')
    assertBlockWithTypeDoesNotExistInWorkspace(workspace, 'charAt')
    assertBlockWithTypeDoesNotExistInWorkspace(workspace, 'text')
    assertEqualBlocksInWorkspace(workspace, numberToBlock(workspace, 1))
  })

  describe('Reduction results', () => {
    describe('even', () => {
      onWorkspace('When it is applied an even number it reduces to true', workspace => {
        const even0 = newFunction(workspace, 'even', numberToBlock(workspace, 0))
        assertThatBlockReducesAndThenExpandsBackCorrectly(even0, booleanToBlock(workspace, true))
      })

      onWorkspace('When it applied an odd number it reduces to false', workspace => {
        const even1 = newFunction(workspace, 'even', numberToBlock(workspace, 1))
        assertThatBlockReducesAndThenExpandsBackCorrectly(even1, booleanToBlock(workspace, false))
      })
    })

    describe('not', () => {
      onWorkspace('When it is applied true it reduces to false', workspace => {
        const notTrue = newFunction(workspace, 'not', booleanToBlock(workspace, true))
        assertThatBlockReducesAndThenExpandsBackCorrectly(notTrue, booleanToBlock(workspace, false))
      })

      onWorkspace('When it is applied false it reduces to true', workspace => {
        const notFalse = newFunction(workspace, 'not', booleanToBlock(workspace, false))
        assertThatBlockReducesAndThenExpandsBackCorrectly(notFalse, booleanToBlock(workspace, true))
      })
    })

    describe('length', () => {
      onWorkspace('when it is applied an empty string it reduces to 0', workspace => {
        const lengthEmpty = newFunction(workspace, 'length', stringToBlock(workspace, ""))
        assertThatBlockReducesAndThenExpandsBackCorrectly(lengthEmpty, numberToBlock(workspace, 0))
      })

      onWorkspace('when it is applied a string it reduces to the amount of characters in the string', workspace => {
        const lengthHelloWorld = newFunction(workspace, 'length', stringToBlock(workspace, "Hello World!"))
        assertThatBlockReducesAndThenExpandsBackCorrectly(lengthHelloWorld, numberToBlock(workspace, 12))
      })
    })

    describe("charAt", () => {
      onWorkspace("when it is passed a valid position of an string and a string, it returns the character at that position", workspace => {
        const charAt0Hello = newFunction(workspace, 'charAt',
          numberToBlock(workspace, 0), stringToBlock(workspace, "Hello")
        )
        assertThatBlockReducesAndThenExpandsBackCorrectly(charAt0Hello, stringToBlock(workspace, "H"))
      })

      onWorkspace("when it is passed an invalid position of an string and a string, it fails without reducing anything", workspace => {
        const six = numberToBlock(workspace, 6)
        const hello = stringToBlock(workspace, "Hello")
        const charAt0Hello = newFunction(workspace, 'charAt', six, hello)

        charAt0Hello.reduce()

        assertErrorReported('Posición fuera de límites') 
        assert.exists(workspace.getBlockById(charAt0Hello.id))
        assert.exists(workspace.getBlockById(hello.id))
        assert.exists(workspace.getBlockById(six.id))
      })
    })

    describe('id', () => {
      onWorkspace('when it is applied any paramter it reduces to that parameter', workspace => {
        const id0 = newFunction(workspace, 'id', numberToBlock(workspace, 0))
        assertThatBlockReducesAndThenExpandsBackCorrectly(id0, numberToBlock(workspace, 0))
      })
    })

    describe('composition', () => {
      onWorkspace('reduction works', workspace => {
        const odd0 = newFunction(workspace, 'composition',
          newFunction(workspace, 'not'), newFunction(workspace, 'even'), numberToBlock(workspace, 0)
        )
        assertThatBlockReducesAndThenExpandsBackCorrectly(odd0, booleanToBlock(workspace, false))
      })
    })

    describe('any', () => {
      onWorkspace('on empty list', workspace => {
        const anyEvenEmpty = newFunction(workspace, 'any',
          newFunction(workspace, 'even'), listToBlock(workspace, [])
        )
        assertThatBlockReducesAndThenExpandsBackCorrectly(anyEvenEmpty, booleanToBlock(workspace, false))
      })

      onWorkspace('When any element apply', workspace => {
        const numbers = [1, 2].map(n => numberToBlock(workspace, n))
        const anyEven12 = newFunction(workspace, 'any',
          newFunction(workspace, 'even'), listToBlock(workspace, numbers)
        )
        assertThatBlockReducesAndThenExpandsBackCorrectly(anyEven12, booleanToBlock(workspace, true))
      })

      onWorkspace('When no element apply', workspace => {
        const numbers = [1, 3].map(n => numberToBlock(workspace, n))
        const anyEven13 = newFunction(workspace, 'any',
          newFunction(workspace, 'even'), listToBlock(workspace, numbers)
        )
        assertThatBlockReducesAndThenExpandsBackCorrectly(anyEven13, booleanToBlock(workspace, false))
      })
    })

    describe('all', () => {

      onWorkspace('on empty list', workspace => {
        const even = newFunction(workspace, 'even')
        const block = newFunction(workspace, 'all', even, listToBlock(workspace, []))
        assertThatBlockReducesAndThenExpandsBackCorrectly(block, booleanToBlock(workspace, true))
      })

      onWorkspace('when all elements apply', workspace => {
        const even = newFunction(workspace, 'even')
        const numbers = [2, 4].map(n => numberToBlock(workspace, n))
        const block = newFunction(workspace, 'all', even, listToBlock(workspace, numbers))
        assertThatBlockReducesAndThenExpandsBackCorrectly(block, booleanToBlock(workspace, true))
      })

      onWorkspace('When some elements apply', workspace => {
        const even = newFunction(workspace, 'even')
        const numbers = [2, 3].map(n => numberToBlock(workspace, n))
        const block = newFunction(workspace, 'all', even, listToBlock(workspace, numbers))
        assertThatBlockReducesAndThenExpandsBackCorrectly(block, booleanToBlock(workspace, false))
      })
    })

    describe('filter', () => {
      onWorkspace('reduction works', workspace => {
        const even = newFunction(workspace, 'even')
        const numbers = [1, 2, 3].map(n => numberToBlock(workspace, n))
        const block = newFunction(workspace, 'filter', even, listToBlock(workspace, numbers))

        const expectedNumbers = [2].map(n => numberToBlock(workspace, n))
        assertThatBlockReducesAndThenExpandsBackCorrectly(block, listToBlock(workspace, expectedNumbers))
      })
    })

    describe('map', () => {
      onWorkspace('reduction works', workspace => {
        const numbers = [1, 3].map(n => numberToBlock(workspace, n))
        const words = ["a", "asd"].map(s => stringToBlock(workspace, s))
        const block = newFunction(workspace, 'map',
          newFunction(workspace, 'length'), listToBlock(workspace, words)
        )
        const expectedList = listToBlock(workspace, numbers)

        assertThatBlockReducesAndThenExpandsBackCorrectly(block, expectedList)
      })
    })

    describe('maximum', () => {
      onWorkspace('reduction works', workspace => {
        const numbers = [1, 3].map(n => numberToBlock(workspace, n))
        const block = newFunction(workspace, 'maximum', listToBlock(workspace, numbers))

        assertThatBlockReducesAndThenExpandsBackCorrectly(block, numberToBlock(workspace, 3))
      })

      onWorkspace("on empty list should fail", workspace => {
        const emptyList = listToBlock(workspace, [])
        const block = newFunction(workspace, 'maximum', emptyList)
        block.reduce()
        
        assertErrorReported('La lista está vacía') 
        assert.exists(workspace.getBlockById(block.id))
        assert.exists(workspace.getBlockById(emptyList.id))
      })
    })

    describe('minimum', () => {
      onWorkspace('reduction works', workspace => {
        const numbers = [1, 3].map(n => numberToBlock(workspace, n))
        const block = newFunction(workspace, 'minimum', listToBlock(workspace, numbers))

        assertThatBlockReducesAndThenExpandsBackCorrectly(block, numberToBlock(workspace, 1))
      })

      onWorkspace("on empty list should fail", workspace => {
        const emptyList = listToBlock(workspace, [])
        const block = newFunction(workspace, 'minimum', emptyList)
        block.reduce()
        
        assertErrorReported('La lista está vacía') 
        assert.exists(workspace.getBlockById(block.id))
        assert.exists(workspace.getBlockById(emptyList.id))
      })
    })

    describe('fold', () => {
      onWorkspace('reduction works', workspace => {
        const numbers = listToBlock(workspace, [1, 2, 3].map(n => numberToBlock(workspace, n)))
        const zero = numberToBlock(workspace, 0)
        const add = newBlockWithFields(workspace, "math_arithmetic", { "OP": "ADD" })
        const sumOfOneTwoAndThree = newFunction(workspace, 'fold', add, zero, numbers)

        assertThatBlockReducesAndThenExpandsBackCorrectly(sumOfOneTwoAndThree, numberToBlock(workspace, 6))
      })
    })

    describe('when using partially applied functions of several parameters', () => {
      onWorkspace('reduction works', workspace => {
        const numbers = listToBlock(workspace, [1, 2, 3].map(n => numberToBlock(workspace, n)))
        const zero = numberToBlock(workspace, 0)
        const fold = newFunction(workspace, 'fold', undefined, undefined, numbers)
        const id = newFunction(workspace, 'id')
        const add = newBlockWithFields(workspace, "math_arithmetic", { "OP": "ADD" })
        const composition = newFunction(workspace, 'composition', fold, id, add)
        const application = newFunction(workspace, 'apply', composition, zero)

        assertThatBlockReducesAndThenExpandsBackCorrectly(application, numberToBlock(workspace, 6))
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

const assertThatBlockReducesAndThenExpandsBackCorrectly = (block, expectedBlock) => {
  const workspace = block.workspace
  const originalType = blockType(block)
  const originalColor = block.getColour()

  block.reduce()
  forceBlocklyEvents()

  const reducedBlock = getLastTopBlock(workspace)
  assertEqualBlocks(reducedBlock, expectedBlock)
  assertBlockKeepsItsPropertiesWhenExpandedBack(workspace, reducedBlock, originalType, originalColor)
}

const assertBlockKeepsItsPropertiesWhenExpandedBack = (workspace, reducedBlock, originalType, originalColor) => {
  reducedBlock.expand()
  forceBlocklyEvents()

  const expandedBlock = getLastTopBlock(workspace)
  assert.equal(expandedBlock.getColour(), originalColor)
  assertType(expandedBlock, originalType)
}

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

const getLastTopBlock = (workspace) => workspace.getTopBlocks().pop()