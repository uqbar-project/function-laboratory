'use strict'

const assertTypeError = (result, error = "Type Error") => assert.deepEqual(result, { error })

const assertImpossibleRecursiveType = (result) => assert.deepEqual(result, { error: "Impossible recursive type" })

const assertTypeVariables = (result, expectedTypeVariables) => assert.deepEqual(result.typeDictionary, expectedTypeVariables)

describe('Constraint Solving', () => {
  const String = createType("String")
  const Number = createType("Number")
  const a = createType("a")

  it('single type with itself works', () => {
    const constraints = Number.eqConstraints(Number)

    const result = solveConstraints({ constraints })

    assertTypeVariables(result, {})
  })

  it('2 different single types fail', () => {
    const constraints = Number.eqConstraints(String)

    const result = solveConstraints({ constraints })

    assertTypeError(result, typeError(Number, String))
  })

  it('parametric type with single type works', () => {
    const constraints = a.eqConstraints(String)

    const result = solveConstraints({ constraints })

    assertTypeVariables(result, { a: String })
  })

  it('function of parametric types to single type fails', () => {
    const constraints = createType(["a", "a"]).eqConstraints(createType("Number"))

    const result = solveConstraints({ constraints })

    assertTypeError(result)
  })

  it('function of same parametric types to function of same single types works', () => {
    const constraints = createType(["a", "a"]).eqConstraints(createType(["Number", "Number"]))

    const result = solveConstraints({ constraints })

    assertTypeVariables(result, { a: createType("Number") })
  })

  it('function of different parametric types to function of same single types works', () => {
    const constraints = createType(["a", "b"]).eqConstraints(createType(["Number", "Number"]))

    const result = solveConstraints({ constraints })

    assertTypeVariables(result, { a: createType("Number"), b: createType("Number") })
  })

  it('function of different parametric types to function of different single types works', () => {
    const constraints = createType(["a", "b"]).eqConstraints(createType(["Number", "String"]))

    const result = solveConstraints({ constraints })

    assertTypeVariables(result, { a: createType("Number"), b: createType("String") })
  })

  it('function of same parametric types to function of different single types fails', () => {
    const constraints = createType(["a", "a"]).eqConstraints(createType(["Number", "String"]))

    const result = solveConstraints({ constraints })

    assertTypeError(result)
  })

  it('function of different parametric types to function of those same parametric types swaped works', () => {
    const constraints = createType(["a", "b"]).eqConstraints(createType(["b", "a"]))

    const result = solveConstraints({ constraints })

    assertTypeVariables(result, { a: createType("b") })
  })

  it('parametric type to function of single types works', () => {
    const constraints = createType("a").eqConstraints(createType(["Number", "Number"]))

    const result = solveConstraints({ constraints })

    assertTypeVariables(result, { a: createType(["Number", "Number"]) })
  })

  it('function of parametric types to a new parametric type works', () => {
    const constraints = createType(["a", "b"]).eqConstraints(createType(["c"]))

    const result = solveConstraints({ constraints })

    assertTypeVariables(result, { c: createType(["a", "b"]) })
  })

  it('function of different parametric types to function of 2 new different parametric types works', () => {
    const constraints = createType(["a", "b"]).eqConstraints(createType(["c", "d"]))

    const result = solveConstraints({ constraints })

    assertTypeVariables(result, { a: createType("c"), b: createType("d") })
  })

  it('function of different parametric types to function of same new parametric type works', () => {
    const constraints = createType(["c", "a"]).eqConstraints(createType(["x", "x"]))

    const result = solveConstraints({ constraints })

    assertTypeVariables(result, { c: createType("x"), a: createType("x") })
  })

  it('function of same parametric types to function of 2 new different parametric types works', () => {
    const constraints = createType(["x", "x"]).eqConstraints(createType(["c", "a"]))

    const result = solveConstraints({ constraints })

    assertTypeVariables(result, { x: createType("a"), c: createType("a") })
  })

  it('function of 2 parametric types to one of them with function of the same single type twice to that same single type works', () => {
    const constraints = createType([["a", "b"], "a"]).eqConstraints(createType([["Number", "Number"], "Number"]))

    const result = solveConstraints({ constraints })

    assertTypeVariables(result, { a: createType("Number"), b: createType("Number") })
  })

  it('function of parametric types with function of single types where each parametric types corresponds to a single type by its position works', () => {
    const constraints = createType([["a", "b"], "a"]).eqConstraints(createType([["Number", "String"], "Number"]))

    const result = solveConstraints({ constraints })

    assertTypeVariables(result, { a: createType("Number"), b: createType("String") })
  })

  it('function of parametric types with function of single types but where a parametric type corresponds to 2 different single types fails', () => {
    const constraints = createType([["a", "b"], "a"]).eqConstraints(createType([["String", "Number"], "Number"]))

    const result = solveConstraints({ constraints })

    assertTypeError(result)
  })

  it('function of parametric types to single type fails', () => {
    const constraints = createType([["a", "b"], "a"]).eqConstraints(createType("Number"))

    const result = solveConstraints({ constraints })

    assertTypeError(result)
  })

  it('high order function of parametric types to non high order function of single types fails', () => {
    const constraints = createType([["a", "b"], "a"]).eqConstraints(createType(["Number", "Number"]))

    const result = solveConstraints({ constraints })

    assertTypeError(result)
  })

  it('high order function of parametric types to function that receives a parametric type as parameter works', () => {
    const constraints = createType([["a", "b"], "a"]).eqConstraints(createType(["c", "Number"]))

    const result = solveConstraints({ constraints })

    assertTypeVariables(result, { a: createType("Number"), c: createType(["Number", "b"]) })
  })

  it("function of parametric types that would need a parametric type to mean both another parametric type and a function containing that parametric type fails because of recursivity", () => {
    const constraints = createType([["a", "b"], "a"]).eqConstraints(createType(["c", "c"]))

    const result = solveConstraints({ constraints })

    assertImpossibleRecursiveType(result)
  })
})
