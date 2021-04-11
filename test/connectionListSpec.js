'use strict'

describe('List connections', () => {

  onWorkspace('should add new empty input', workspace => {
    const list = workspace.newBlock('list')
    const text = workspace.newBlock('text')

    connect(list, text)

    assertConnection(list, text)
    assert.equal(blockInputs(list).length, 2)
    const newInput = blockInputs(list)[1]
    assert.equal(getInputField(newInput), ',')
    assertLimitInputFields(list)
  })

  onWorkspace('should accept many elements', workspace => {
    const list = workspace.newBlock('list')
    const text0 = workspace.newBlock('text')
    const text1 = workspace.newBlock('text')
    const text2 = workspace.newBlock('text')

    connect(list, text0, 0)
    connect(list, text1, 1)
    connect(list, text2, 2)

    assertConnection(list, text0)
    assertConnection(list, text1)
    assertConnection(list, text2)
  })

  onWorkspace('should reject other type elements', workspace => {
    const list = workspace.newBlock('list')
    const text = workspace.newBlock('text')
    const number = workspace.newBlock('math_number')

    connect(list, text, 0)
    connect(list, number, 1)

    assertConnection(list, text)
    assertRejectedConnection(list, number)
  })

  onWorkspace('should reject other type elements even when the list is a parameter on another block', workspace => {
    const any = workspace.newBlock('any')
    const list = workspace.newBlock('list')
    const text = workspace.newBlock('text')
    const number = workspace.newBlock('math_number')

    connect(any, list, 1)
    connect(list, text, 0)
    connect(list, number, 1)

    assertConnection(any, list)
    assertConnection(list, text)
    assertRejectedConnection(list, number)
  })

  onWorkspace('should reorganize empty inputs', workspace => {
    const list = workspace.newBlock('list')
    const text0 = workspace.newBlock('text')
    const text1 = workspace.newBlock('text')

    connect(list, text0, 0)
    connect(list, text1, 1)
    disconnect(list, 0)

    assertConnection(list, text1)
    assertLimitInputFields(list)
  })


  onWorkspace('should accept other lists as elements', workspace => {
    const innerList0 = workspace.newBlock('list')
    const text0 = workspace.newBlock('text')
    connect(innerList0, text0, 0)

    const innerList1 = workspace.newBlock('list')
    const text1 = workspace.newBlock('text')
    const otherText1 = workspace.newBlock('text')
    connect(innerList1, text1, 0)
    connect(innerList1, otherText1, 1)
    
    const list = workspace.newBlock('list')
    connect(list, innerList0, 0)
    connect(list, innerList1, 1)

    assertConnection(list, innerList0)
    assertConnection(list, innerList1)
  })
})

const assertLimitInputFields = (listBlock) => {
  assert.equal(getInputField(listBlock.inputList[0]), '[')
  assert.equal(getInputField(last(listBlock.inputList)), ']')
}