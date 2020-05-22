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
}