'use strict'

const assertBlockWithTypeDoesNotExistInWorkspace = (workspace, type) =>
  assert.isEmpty(workspace.getBlocksByType(type))

const assertAnyBlockInWorkspaceSatisfies = (workspace, condition) => {
  assert.exists(workspace.getAllBlocks().find(condition))
}

const assertReplacedByBlockThatSatisfies = (workspace, oldBlock, newBlockCondition) => {
  const oldBlockWithChildren = [oldBlock, ...oldBlock.getChildren()]
  oldBlockWithChildren.forEach(block => assert.notExists(workspace.getBlockById(block.id)))

  assertAnyBlockInWorkspaceSatisfies(workspace, newBlockCondition)
}

describe('Reducing expressions', () => {
  onWorkspace('reducing an unapplied function fails and keeps it in the workspace', workspace => {
    const even = workspace.newBlock('even')

    assert.throws(() => even.reduce())

    assertAnyBlockInWorkspaceSatisfies(workspace, ({type}) => type == 'even')
  })

  onWorkspace('reducing an applied function removes it and its parameter from workspace and adds result to workspace', workspace => {
    const even = workspace.newBlock('even')
    const zero = workspace.newBlock('math_number')
    connect(even, zero)

    even.reduce()

    assertBlockWithTypeDoesNotExistInWorkspace(workspace, 'even')
    assertBlockWithTypeDoesNotExistInWorkspace(workspace, 'math_number')
    assertAnyBlockInWorkspaceSatisfies(workspace, (block) => {
      return block.type == 'logic_boolean' && block.getFieldValue("BOOL") == "TRUE"
    })
  })

  describe('Reduction results', () => {
    describe('even', () => {
      onWorkspace('When it is applied an even number it reduces to true', workspace => {
        const even = workspace.newBlock('even')
        const zero = newBlockWithFields(workspace, 'math_number', {NUM: 0})
        connect(even, zero)

        even.reduce()

        assertReplacedByBlockThatSatisfies(workspace, even, (newBlock) => {
          return newBlock.type == 'logic_boolean' && newBlock.getFieldValue("BOOL") == "TRUE"
        })
      }),

      onWorkspace('When it applied an odd number it reduces to false', workspace => {
        const even = workspace.newBlock('even')
        const one = newBlockWithFields(workspace, 'math_number', {NUM: 1})
        connect(even, one)

        even.reduce()

        assertReplacedByBlockThatSatisfies(workspace, even, (newBlock) => {
          return newBlock.type == 'logic_boolean' && newBlock.getFieldValue("BOOL") == "FALSE"
        })
      })
    })

    describe('not', () => {
      onWorkspace('When it is applied true it reduces to false', workspace => {
        const not = workspace.newBlock('not')
        const tru = newBlockWithFields(workspace, 'logic_boolean', {BOOL:"TRUE"})
        connect(not, tru)

        not.reduce()

        assertReplacedByBlockThatSatisfies(workspace, not, newBlock => {
          return newBlock.type == 'logic_boolean' && newBlock.getFieldValue("BOOL") == "FALSE"
        })
      })

      onWorkspace('When it is applied false it reduces to true', workspace => {
        const not = workspace.newBlock('not')
        const fols = newBlockWithFields(workspace, 'logic_boolean', {BOOL:"FALSE"})
        connect(not, fols)

        not.reduce()

        assertReplacedByBlockThatSatisfies(workspace, not, newBlock => {
          return newBlock.type == 'logic_boolean' && newBlock.getFieldValue("BOOL") == "TRUE"
        })
      })
    })

    describe('id', () => {
      onWorkspace('when it is applied any paramter it reduces to that parameter', workspace => {
        const id = workspace.newBlock('id')
        const zero = newBlockWithFields(workspace, 'math_number', {NUM:0})
        connect(id, zero)

        id.reduce()

        assertReplacedByBlockThatSatisfies(workspace, id, (newBlock) => {
          return newBlock.type == 'math_number' && newBlock.getFieldValue("NUM") == 0
        })
      })
    })

    describe('length', () => {
      onWorkspace('when it is applied an empty string it reduces to 0', workspace => {
        const length = workspace.newBlock('length')
        const emptyString = workspace.newBlock('text')
        connect(length, emptyString)

        length.reduce()

        assertReplacedByBlockThatSatisfies(workspace, length, (newBlock) => {
          return newBlock.type == 'math_number' && newBlock.getFieldValue("NUM") == 0
        })
      })

      onWorkspace('when it is applied a string it reduces to the amount of characters in the string', workspace => {
        const length = workspace.newBlock('length')
        const helloWorld = newBlockWithFields(workspace, 'text', {TEXT:"Hello World!"})
        connect(length, helloWorld)

        length.reduce()

        assertReplacedByBlockThatSatisfies(workspace, length, (newBlock) => {
          return newBlock.type == 'math_number' && newBlock.getFieldValue("NUM") == 12
        })
      })
    })

    describe("charAt", () => {
      onWorkspace("when it is passed a valid position of an string and a string, it returns the character at that position", workspace => {
        const charAt = workspace.newBlock('charAt')
        const hello = newBlockWithFields(workspace, 'text', {TEXT:"Hello"})
        const zero = newBlockWithFields(workspace, 'math_number', {NUM:0})
        connect(charAt, zero, 0)
        connect(charAt, hello, 1)

        charAt.reduce()

        assertReplacedByBlockThatSatisfies(workspace, charAt, newBlock => {
          return newBlock.type == 'text' && newBlock.getFieldValue("TEXT") == "H"
        })
      })

      onWorkspace("when it is passed an invalid position of an string and a string, it fails without reducing anything", workspace => {
        const charAt = workspace.newBlock('charAt')
        const hello = newBlockWithFields(workspace, 'text', {TEXT:"Hello"})
        const six = newBlockWithFields(workspace, 'math_number', {NUM:6})
        connect(charAt, six, 0)
        connect(charAt, hello, 1)

        charAt.reduce()

        assert.exists(workspace.getBlockById(charAt.id))
        assert.exists(workspace.getBlockById(hello.id))
        assert.exists(workspace.getBlockById(six.id))
      })
    })
  })
})
