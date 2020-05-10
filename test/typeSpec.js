'use strict'

describe('Types', () => {

  onWorkspace('value type', workspace => {
    const number = workspace.newBlock('math_number')
    assertTypeAsStrings(number, 'Number')
  })


  describe('one param function', () => {

    onWorkspace('type', workspace => {
      const even = workspace.newBlock('even')
      assertTypeAsStrings(even, 'Number', 'Boolean')
    })

    onWorkspace('applied type', workspace => {
      const even = workspace.newBlock('even')
      const number = workspace.newBlock('math_number')
      connect(even, number)
      assertTypeAsStrings(even, 'Boolean')
    })

  })

  describe('many param function', () => {

    onWorkspace('type', workspace => {
      const charAt = workspace.newBlock('charAt')
      assertTypeAsStrings(charAt, 'Number', 'String', 'String')
    })

    onWorkspace('first param applied type', workspace => {
      const charAt = workspace.newBlock('charAt')
      const number = workspace.newBlock('math_number')
      connect(charAt, number, 0)
      assertTypeAsStrings(charAt, 'String', 'String')
    })

    onWorkspace('second param applied type', workspace => {
      const charAt = workspace.newBlock('charAt')
      const text = workspace.newBlock('text')
      connect(charAt, text, 1)
      assertTypeAsStrings(charAt, 'Number', 'String')
    })

  })

  describe('parametric type', () => {

    onWorkspace('input parametric type', workspace => {
      const compare = workspace.newBlock('compare')
      assertTypeAsStrings(compare, 'a', 'a', 'Boolean')
    })

    onWorkspace('output parametric type', workspace => {
      const id = workspace.newBlock('id')
      assertTypeAsStrings(id, 'a', 'a')
    })

    onWorkspace('inferred input type', workspace => {
      const compare = workspace.newBlock('compare')
      const number = workspace.newBlock('math_number')
      connect(compare, number, 0)
      assertTypeAsStrings(compare, 'Number', 'Boolean')
    })

    onWorkspace('inferred output type', workspace => {
      const id = workspace.newBlock('id')
      const number = workspace.newBlock('math_number')
      connect(id, number, 0)
      assertTypeAsStrings(id, 'Number')
    })
  })

  describe('list type', () => {

    onWorkspace('element parametric type', workspace => {
      const list = workspace.newBlock('list')
      assertType(list, new ListType(createType('a')))
    })

    onWorkspace('inferred element type', workspace => {
      const list = workspace.newBlock('list')
      const number = workspace.newBlock('math_number')
      connect(list, number)
      assertType(list, new ListType(createType('Number')))
    })

    onWorkspace('inferred function element type', workspace => {
      const list = workspace.newBlock('list')
      const id = workspace.newBlock('id')
      connect(list, id)
      assertType(list, new ListType(createType(['a1', 'a1'])))
    })

    onWorkspace('inferred complex element type', workspace => {
      const list = workspace.newBlock('list')
      const innerList = workspace.newBlock('list')
      const id = workspace.newBlock('id')
      connect(innerList, id)
      connect(list, innerList)
      assertType(list, new ListType(new ListType(createType(['a1', 'a1']))))
    })
  })


  describe('composition', () => {

    onWorkspace('type', workspace => {
      const composition = workspace.newBlock('composition')

      // (.)
      assertTypeAsStrings(composition, ['b', 'c'], ['a', 'b'], 'a', 'c')
    })

    onWorkspace('type when applying a value with a concrete type as the third parameter', workspace => {
      const composition = workspace.newBlock('composition')
      const number = workspace.newBlock('math_number')
      
      // \x y -> (x . y) $ 0
      connect(composition, number, 2)

      assertTypeAsStrings(composition, ['b', 'c'], ['Number', 'b'], 'c')
    })

    onWorkspace('type when applying a value with a parametric type as the third parameter', workspace => {
      const composition = workspace.newBlock('composition')
      const id = workspace.newBlock('id')

      // \x y -> (x . y) $ id
      connect(composition, id, 2)

      assertTypeAsStrings(composition, ['b', 'c'], [['a1', 'a1'], 'b'], 'c')
    })

    onWorkspace('type when applying a function with concrete types as the first parameter', workspace => {
      const composition = workspace.newBlock('composition')
      const even = workspace.newBlock('even')

      // (even .)
      connect(composition, even, 0)

      assertTypeAsStrings(composition, ['a', 'Number'], 'a', 'Boolean')
    })

    onWorkspace('type when applying a function with concrete types as the second parameter', workspace => {
      const composition = workspace.newBlock('composition')
      const even = workspace.newBlock('even')

      // (. even)
      connect(composition, even, 1)

      assertTypeAsStrings(composition, ['Boolean', 'c'], 'Number', 'c')
    })

    
    onWorkspace('type when applying a function with parametric types as the second parameter', workspace => {
      const composition = workspace.newBlock('composition')
      const otherComposition = workspace.newBlock('composition')

      // (. (.))
      connect(composition, otherComposition, 1)

      assertTypeAsStrings(composition, [[['a1', 'b1'], 'a1', 'c1'], 'c'], ['b1', 'c1'], 'c')
    })

    onWorkspace('type when applying a function with parametric types as the first parameter', workspace => {
      const composition = workspace.newBlock('composition')
      const otherComposition = workspace.newBlock('composition')

      // ((.) .)
      connect(composition, otherComposition, 0)

      assertTypeAsStrings(composition, ['a', 'b1', 'c1'], 'a', ['a1', 'b1'], 'a1', 'c1')
    })

    onWorkspace('type when applying 2 compatible functions with concrete types', workspace => {
      const composition = workspace.newBlock('composition')
      const even = workspace.newBlock('even')
      const not = workspace.newBlock('not')

      // (not . even)
      connect(composition, even, 1)
      connect(composition, not, 0)

      assertTypeAsStrings(composition, 'Number', 'Boolean')
    })

    onWorkspace('type when applying 2 compatible functions with parametric types', workspace => {
      const composition = workspace.newBlock('composition')
      const anotherComposition = workspace.newBlock('composition')
      const evenAnotherComposition = workspace.newBlock('composition')

      // ((.) . (.))
      connect(composition, anotherComposition, 1)
      connect(composition, evenAnotherComposition, 0)

      assertTypeAsStrings(composition, ['b2', 'c2'], ['a1', 'a2', 'b2'], 'a1', 'a2', 'c2')
    })
  })
})

const assertTypeAsStrings = (block, ...types) => {
  assertType(block, createType(types))
}


const assertType = (block, type) => {
  assert.equal(blockType(block).toString(), type.toString())
}
