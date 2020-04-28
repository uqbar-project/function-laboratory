'use strict'

describe('Colors', () => {

  onWorkspace('value color', workspace => {
    const number = workspace.newBlock('math_number')
    assertColorType(number, typeToColor('Number'))
  })

  onWorkspace('function color', workspace => {
    const even = workspace.newBlock('even')
    assertColorType(even, 20 + 60)
  })
})

const assertColorType = (block, color) => {
  assert.equal(typeToColor(functionType(block)), color)
}
