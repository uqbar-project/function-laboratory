const solveConstraints = ({ constraints, typeDictionary = {}}) => {
  const [constraint, ...restOfConstraints] = constraints

  if(constraints.length == 0) { return { constraints, typeDictionary } }

  const constraintResult = constraint.solve()
  
  if(constraintResult.error) { return constraintResult }

  const typeDictionaryAfterReplacements = mapValues(type => type.replacing(constraintResult))(typeDictionary)

  const newConstraints = restOfConstraints.map(constraint => constraint.replace(constraintResult))

  const newTypeDictionary = {...typeDictionaryAfterReplacements, ...constraintResult}

  return solveConstraints({constraints: newConstraints, typeDictionary: newTypeDictionary})
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
    return new EqConstraint(this.a.replacing(typeDictionary), this.b.replacing(typeDictionary))
  }

  solve() {
    if(this.a.isSameType(this.b)) {
      return {}
    } else if (this.a.isVarType() && this.b.includes(this.a) || this.b.isVarType() && this.b.includes(this.b)) {
      return { error: "Impossible recursive type" }
    } else if (this.a.isVarType()) {
      return { [this.a.typeVariableName]: this.b }
    } else if (this.b.isVarType()) {
      return { [this.b.typeVariableName]: this.a }
    } else if (this.a.isFunctionType() && this.b.isFunctionType()) {
      return solveConstraints({constraints: this.a.eqConstraints(this.b)}).typeDictionary
    } else {
      return { error: "Type Error" }
    }
  }

  toString() {
    return this.a.toString() + " ~ " + this.b.toString()
  }
}