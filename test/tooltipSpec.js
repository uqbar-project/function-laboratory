'use strict'

describe('Tooltip', () => {

  onWorkspace('init with value type', workspace => {
    const number = workspace.newBlock('math_number')
    forceBlocklyEvents()
    assertTooltipType(number, "Number")
  })

  onWorkspace('init with function type', workspace => {
    const even = workspace.newBlock('even')
    forceBlocklyEvents()
    assertTooltipType(even, ["Number", "Boolean"])
  })

  onWorkspace('update with applied function type', workspace => {
    const even = workspace.newBlock('even')
    const number = workspace.newBlock('math_number')
    connect(even, number)
    assertTooltipType(even, "Boolean")
  })

  onWorkspace('update with partially applied function type', workspace => {
    const compare = workspace.newBlock('compare')
    const number = workspace.newBlock('math_number')
    connect(compare, number)
    assertTooltipType(compare, ["Number", "Boolean"])
  })

  onWorkspace('update with partially applied higher order function type', workspace => {
    const filter = workspace.newBlock('filter')
    const even = workspace.newBlock('even')
    connect(filter, even)
    assertTooltipType(filter, [newListType("Number"), newListType("Number")])
  })


  onWorkspace('init with empty list type', workspace => {
    const list = workspace.newBlock('list')
    forceBlocklyEvents()
    assertTooltipType(list, newListType("a"))
  })

  onWorkspace('update with full list type', workspace => {
    const list = workspace.newBlock('list')
    const text = workspace.newBlock('text')
    connect(list, text)
    assertTooltipType(list, newListType("String"))
  })

})


const assertTooltipType = (block, type) => {
  assertTooltip(block, createType(type).toString())
}

const assertTooltip = (block, text) => {
  assert.equal(block.tooltip, text)
}