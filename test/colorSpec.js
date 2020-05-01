'use strict'

describe('Colors', () => {

  const Boolean = createType('Boolean')
  const Number = createType('Number')

  onWorkspace('value', workspace => {
    const number = workspace.newBlock('math_number')
    assertColor(number, typeToColor(Number))
  })

  onWorkspace('function', workspace => {
    const even = workspace.newBlock('even')
    assertColor(even, typeToColor(Number) + typeToColor(Boolean))
  })

  onWorkspace('partial applied function with same type', workspace => {
    const even = workspace.newBlock('even')
    const compare = workspace.newBlock('compare')
    const number = workspace.newBlock('math_number')
    connect(compare, number)
    assertColor(compare, colorType(even))
  })

  onWorkspace('applied function', workspace => {
    const even = workspace.newBlock('even')
    const number = workspace.newBlock('math_number')
    connect(even, number)
    assertColor(even, typeToColor(Boolean))
    assertColor(number, typeToColor(Boolean))
  })

  onWorkspace('applied function with functions', workspace => {
    const not = workspace.newBlock('not')
    const even = workspace.newBlock('even')
    const number = workspace.newBlock('math_number')
    connect(even, number)
    connect(not, even)
    assertColor(not, typeToColor(Boolean))
    assertColor(even, typeToColor(Boolean))
    assertColor(number, typeToColor(Boolean))
  })
})

const assertColor = (block, color) => {
  assert.equal(colorShow(block), color)
}
