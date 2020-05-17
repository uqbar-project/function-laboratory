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
    })
  })
})
