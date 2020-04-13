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

  describe('composition', () => {

    onWorkspace('type', workspace => {
      const composition = workspace.newBlock('composition')
      assertType(composition, 'Any', 'Any', 'Any', 'Any')
    })

  })

})

const assertType = (block, ...types) => {
  assert.equal(functionType(block), asFunctionType(...types))
}
