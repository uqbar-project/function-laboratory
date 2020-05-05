'use strict'

describe('Renaming', () => {
  it('returns the same types if there are no repeated type variables among the types', () => {
    const returnedTypes = allReplaced(createType("Number"), createType("a"), createType("b"))

    assert.deepEqual(returnedTypes, [createType("a"), createType("b")])
  })

  it('returns renamed types for all types that are named the same as a previous type', () => {
    const returnedTypes = allReplaced(createType("a"), createType("a"), createType("b"))

    assert.deepEqual(returnedTypes, [createType("a1"), createType("b")])
  })

  it('does not rename types to already used names', () => {
    const returnedTypes = allReplaced(createType("a"), createType("a1"), createType("a"))

    assert.deepEqual(returnedTypes, [createType("a1"), createType("a2")])
  })

  it('renames all occurrences of type variables to the same names inside the same type', () => {
    const returnedTypes = allReplaced(createType(["a", "b"]), createType(["a", ["b", "a"]]), createType(["a", "b"]))

    assert.deepEqual(returnedTypes, [createType(["a1", ["b1", "a1"]]), createType(["a2", "b2"])])
  })
})
