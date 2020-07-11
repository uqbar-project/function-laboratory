'use strict'

describe('Colors', () => {

  const Boolean = createType('Boolean')
  const Number = createType('Number')
  const String = createType('String')

  onWorkspace('value color is the color of the type', workspace => {
    const number = workspace.newBlock('math_number')
    assertColor(number, typeToColor(Number))
  })

  onWorkspace('function color es la suma del producto de los colores de los tipos de acuerdo a su posicion', workspace => {
    const fType = createType(["Number", "Boolean"])
    var colorList = ['Function','Number','Boolean'].map (colorForType)
    assert.equal(typeToColor(fType), combineColors(colorList))
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

  onWorkspace('empty list color', workspace => {
    const list = workspace.newBlock('list')
    var colorList = ['List','Any'].map (colorForType)
    assertColor(list, combineColors(colorList))
  })

  onWorkspace('full list color', workspace => {
    const list = workspace.newBlock('list')
    const text = workspace.newBlock('text')
    connect(list, text)
    var colorList = ['List','String'].map (colorForType)
    assertColor(list, combineColors(colorList))
  })

  onWorkspace('distintos colores para funciones con los mismos tipos de parametros pero en distinto orden', workspace => {
    const fABType = createType(["Number", "Boolean"])
    const fBAType = createType(["Boolean", "Number"])

    assert.notEqual(typeToColor(fABType), typeToColor(fBAType))
  })


})