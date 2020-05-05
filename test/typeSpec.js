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

      // (.)
      assertType(composition, ['b', 'c'], ['a', 'b'], 'a', 'c')
    })

    onWorkspace('type when applying a value with a concrete type as the third parameter', workspace => {
      const composition = workspace.newBlock('composition')
      const number = workspace.newBlock('math_number')
      
      // \x y -> (x . y) $ 0
      connect(composition, number, 2)

      assertType(composition, ['b', 'c'], ['Number', 'b'], 'c')
    })

    onWorkspace('type when applying a value with a parametric type as the third parameter', workspace => {
      const composition = workspace.newBlock('composition')
      const id = workspace.newBlock('id')

      // \x y -> (x . y) $ id
      connect(composition, id, 2)

      assertType(composition, ['b', 'c'], [['a1', 'a1'], 'b'], 'c')
    })

    onWorkspace('type when applying a function with concrete types as the first parameter', workspace => {
      const composition = workspace.newBlock('composition')
      const even = workspace.newBlock('even')

      // (even .)
      connect(composition, even, 0)

      assertType(composition, ['a', 'Number'], 'a', 'Boolean')
    })

    onWorkspace('type when applying a function with concrete types as the second parameter', workspace => {
      const composition = workspace.newBlock('composition')
      const even = workspace.newBlock('even')

      // (. even)
      connect(composition, even, 1)

      assertType(composition, ['Boolean', 'c'], 'Number', 'c')
    })

    
    onWorkspace('type when applying a function with parametric types as the second parameter', workspace => {
      const composition = workspace.newBlock('composition')
      const otherComposition = workspace.newBlock('composition')

      // (. (.))
      connect(composition, otherComposition, 1)

      assertType(composition, [[['a1', 'b1'], 'a1', 'c1'], 'c'], ['b1', 'c1'], 'c')
    })

    onWorkspace('type when applying a function with parametric types as the first parameter', workspace => {
      const composition = workspace.newBlock('composition')
      const otherComposition = workspace.newBlock('composition')

      // ((.) .)
      connect(composition, otherComposition, 0)

      assertType(composition, ['a', 'b1', 'c1'], 'a', ['a1', 'b1'], 'a1', 'c1')
    })

    onWorkspace('type when applying 2 compatible functions with concrete types', workspace => {
      const composition = workspace.newBlock('composition')
      const even = workspace.newBlock('even')
      const not = workspace.newBlock('not')

      // (not . even)
      connect(composition, even, 1)
      connect(composition, not, 0)

      assertType(composition, 'Number', 'Boolean')
    })

    onWorkspace('type when applying 2 compatible functions with parametric types', workspace => {
      const composition = workspace.newBlock('composition')
      const anotherComposition = workspace.newBlock('composition')
      const evenAnotherComposition = workspace.newBlock('composition')

      // ((.) . (.))
      connect(composition, anotherComposition, 1)
      connect(composition, evenAnotherComposition, 0)

      assertType(composition, ['b2', 'c2'], ['a1', 'a2', 'b2'], 'a1', 'a2', 'c2')
    })
  })
})

const assertType = (block, ...types) => {
  assert.equal(blockType(block).toString(), createType(types).toString())
}
