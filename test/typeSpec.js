'use strict'

describe('Types', () => {

  onWorkspace('value type', workspace => {
    const number = workspace.newBlock('math_number')
    assertType(number, 'Number')
  })


  describe('one param function', () => {

    onWorkspace('type', workspace => {
      const even = workspace.newBlock('even')
      assertType(even, 'Number', 'Boolean')
    })

    onWorkspace('applied type', workspace => {
      const even = workspace.newBlock('even')
      const number = workspace.newBlock('math_number')
      connect(even, number)
      assertType(even, 'Boolean')
    })

  })

  describe('many param function', () => {

    onWorkspace('type', workspace => {
      const charAt = workspace.newBlock('charAt')
      assertType(charAt, 'Number', 'String', 'String')
    })

    onWorkspace('first param applied type', workspace => {
      const charAt = workspace.newBlock('charAt')
      const number = workspace.newBlock('math_number')
      connect(charAt, number, 0)
      assertType(charAt, 'String', 'String')
    })

    onWorkspace('second param applied type', workspace => {
      const charAt = workspace.newBlock('charAt')
      const text = workspace.newBlock('text')
      connect(charAt, text, 1)
      assertType(charAt, 'Number', 'String')
    })

  })

  describe('parametric type', () => {

    onWorkspace('input parametric type', workspace => {
      const compare = workspace.newBlock('compare')
      assertType(compare, 'a', 'a', 'Boolean')
    })

    onWorkspace('output parametric type', workspace => {
      const id = workspace.newBlock('id')
      assertType(id, 'a', 'a')
    })

    onWorkspace('inferred input type', workspace => {
      const compare = workspace.newBlock('compare')
      const number = workspace.newBlock('math_number')
      connect(compare, number, 0)
      assertType(compare, 'Number', 'Boolean')
    })

    onWorkspace('inferred output type', workspace => {
      const id = workspace.newBlock('id')
      const number = workspace.newBlock('math_number')
      connect(id, number, 0)
      assertType(id, 'Number')
    })
  })

  describe('composition', () => {

    onWorkspace('type', workspace => {
      const composition = workspace.newBlock('composition')
      assertType(composition, ['b', 'c'], ['a', 'b'], 'a', 'c')
    })

  })

})

const assertType = (block, ...types) => {
  assert.equal(blockType(block).toString(), createType([types]).toString())
}
