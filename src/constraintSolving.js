const solveConstraints = ({ constraints, typeDictionary = {} }) => {
  const [constraint, ...restOfConstraints] = constraints

  if (constraints.length == 0) { return { constraints, typeDictionary } }

  const constraintResult = constraint.solve()

  if (constraintResult.error) { return constraintResult }

  const typeDictionaryAfterReplacements = mapValues(type => type.replacing(constraintResult))(typeDictionary)

  const newConstraints = restOfConstraints.flatMap(constraint => constraint.replace(constraintResult))

  const newTypeDictionary = { ...typeDictionaryAfterReplacements, ...constraintResult }

  return solveConstraints({ constraints: newConstraints, typeDictionary: newTypeDictionary })
}

class ConstraintError {
  constructor(errorMessage) {
    this.errorMessage = errorMessage
  }

  solve() {
    return { error: this.errorMessage }
  }
}

class EqConstraint {
  constructor(a, b) {
    this.a = a
    this.b = b
  }

  replace(typeDictionary) {
    return this.a.replacing(typeDictionary).eqConstraints(this.b.replacing(typeDictionary))
  }

  solve() {
    try {
      return this.doSolve()
    } catch (e) {
      return { error: e }
    }
  }

  doSolve() {
    throw "Subclass responsibility"
  }

  toString() {
    return this.a.toString() + " ~ " + this.b.toString()
  }
}

class SimpleEqConstraint extends EqConstraint {
  constructor(simpleType, otherType) {
    super(simpleType, otherType)
    this.simpleType = simpleType
    this.otherType = otherType
  }

  doSolve() {
    try {
      return this.otherType.restrictToSimple(this.simpleType)
    } catch (e) {
      return { error: e }
    }
  }
}

class CompositeEqConstraint extends EqConstraint {
  constructor(compositeType, otherType) {
    super(compositeType, otherType)
    this.compositeType = compositeType
    this.otherType = otherType
  }

  doSolve() {
    try {
      return this.otherType.restrictToComposite(this.compositeType)
    } catch (e) {
      return { error: e }
    }
  }
}

class ParametricEqConstraint extends EqConstraint {
  constructor(parametricType, otherType) {
    super(parametricType, otherType)
    this.parametricType = parametricType
    this.otherType = otherType
  }

  doSolve() {
    this.validateRecursiveType()
    return this.parametricType.restrict(this.otherType)
  }

  validateRecursiveType() {
    if (this.otherType.includes(this.parametricType))
      throw "Impossible recursive type"
  }
}

const typeError = (expectedType, currentType) => `Se esperaba ${expectedType.toString()} pero se obtuvo ${currentType.toString()}`