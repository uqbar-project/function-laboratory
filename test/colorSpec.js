'use strict'

describe('Colors', () => {

  const Boolean = createType('Boolean')
  const Number = createType('Number')

  onWorkspace('value color is the color of the type', workspace => {
    const number = workspace.newBlock('math_number')
    assertColor(number, typeToColor(Number))
  })

  onWorkspace('function color is the sum of the color of its inputs types and its output type', workspace => {
    const even = workspace.newBlock('even')
    assertColor(even, typeToColor(Number) + typeToColor(Boolean))
  })

  onWorkspace('partial applied function color is the same as the color of a function whose type is the same as the the partial applied function s type', workspace => {
    const even = workspace.newBlock('even')
    const compare = workspace.newBlock('compare')
    const number = workspace.newBlock('math_number')
    connect(compare, number)
    assertColor(compare, colorType(even))
  })

  onWorkspace('applied function color is the color of its output type', workspace => {
    const even = workspace.newBlock('even')
    const number = workspace.newBlock('math_number')
    connect(even, number)
    assertColor(even, typeToColor(Boolean))
    assertColor(number, typeToColor(Boolean))
  })

  onWorkspace('applied function with an applied function as its parameter color is the color of its output type', workspace => {
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
