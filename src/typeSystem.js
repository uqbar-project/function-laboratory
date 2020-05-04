class Type {
  eqConstraints(otherType) {
    throw "Subclass responsibility"
  }

  allTypeVariableNamesUsed(otherType) {
    throw "Subclass responsibility"
  }

  isSameType(otherType) {
    throw "Subclass responsibility"
  }

  includes(parametricType) {
    throw "Subclass responsibility"
  }

  eqConstraintsForSingleType(otherType) {
    throw "Subclass responsibility"
  }

  eqConstraintsForFunctionType(otherType) {
    throw "Subclass responsibility"
  }

  eqConstraintsForParametricType(otherType) {
    throw "Subclass responsibility"
  }

  replacing(typeMap) {
    throw "Subclass responsibility"
  }

  isVarType() {
    return false
  }

  isFunctionType() {
    return false
  }

  toString() {
    throw "Subclass responsibility"
  }

  toStringAsInput() {
    return this.toString()
  }

  toColor(_typeColors) {
    throw "Subclass responsibility"
  }
}

class FunctionType extends Type {
  constructor(inputType, outputType) {
    super();
    this.inputType = inputType;
    this.outputType = outputType;
  }

  isFunctionType() {
    return true
  }

  allTypeVariableNamesUsed() {
    return this.inputType.allTypeVariableNamesUsed().concat(this.outputType.allTypeVariableNamesUsed())
  }

  isSameType(otherType) {
    return otherType.inputType &&
      otherType.outputType &&
      this.inputType.isSameType(otherType.inputType) &&
      this.outputType.isSameType(otherType.outputType)
  }

  includes(parametricType) {
    const typeVariableName = parametricType.typeVariableName
    return (this.inputType.typeVariableName == typeVariableName || this.outputType.typeVariableName == typeVariableName) ||
      this.inputType.includes(parametricType) || this.outputType.includes(parametricType)
  }

  replacing(typeMap) {
    return new FunctionType(this.inputType.replacing(typeMap), this.outputType.replacing(typeMap))
  }

  eqConstraints(otherType) {
    return otherType.eqConstraintsForFunctionType(this)
  }

  eqConstraintsForSingleType(_otherType) {
    return [new ConstraintError("Type Error")]
  }

  eqConstraintsForFunctionType(otherType) {
    return otherType.inputType.eqConstraints(this.inputType).concat(otherType.outputType.eqConstraints(this.outputType))
  }

  eqConstraintsForParametricType(otherType) {
    return [new EqConstraint(otherType, this)]
  }

  toStringAsInput() {
    return "(" + this.toString() + ")"
  }

  toString() {
    return this.inputType.toStringAsInput() + " -> " + this.outputType.toString()
  }

  toColor(typeColors) {
    return this.inputType.toColor(typeColors) + this.outputType.toColor(typeColors)
  }
}

class SingleType extends Type {
  constructor(typeName) {
    super();
    this.typeName = typeName;
  }

  replacing(typeMap) {
    return this
  }

  allTypeVariableNamesUsed() {
    return []
  }

  isSameType(otherType) {
    return otherType.typeName == this.typeName
  }

  includes(parametricType) {
    return false
  }

  eqConstraints(otherType) {
    return otherType.eqConstraintsForSingleType(this)
  }

  eqConstraintsForSingleType(otherType) {
    return [new EqConstraint(otherType, this)]
  }

  eqConstraintsForFunctionType(_otherType) {
    return [new ConstraintError("Type Error")]
  }

  eqConstraintsForParametricType(otherType) {
    return [new EqConstraint(otherType, this)]
  }

  toString() {
    return this.typeName;
  }

  toColor(typeColors) {
    return typeColors[this.typeName] || 0;
  }
}

class ParametricType extends Type {
  constructor(typeVariableName) {
    super();
    this.typeVariableName = typeVariableName;
  }

  isVarType() {
    return true
  }

  allTypeVariableNamesUsed() {
    return [this.typeVariableName]
  }

  isSameType(otherType) {
    return otherType.typeVariableName == this.typeVariableName
  }

  includes(parametricType) {
    return false
  }

  replacing(typeMap) {
    return (typeMap[this.typeVariableName] && typeMap[this.typeVariableName].replacing(typeMap)) || this
  }

  eqConstraints(otherType) {
    return otherType.eqConstraintsForParametricType(this)
  }

  eqConstraintsForParametricType(otherType) {
    return [new EqConstraint(otherType, this)]
  }

  eqConstraintsForSingleType(otherType) {
    return [new EqConstraint(otherType, this)]
  }

  eqConstraintsForFunctionType(otherType) {
    return [new EqConstraint(otherType, this)]
  }

  toString() {
    return this.typeVariableName;
  }

  toColor(typeColors) {
    return typeColors['Any']
  }
}

const createType = (typeName) => {
  if(Array.isArray(typeName)) {
    if (typeName.length > 1) {
      const [inputTypeName, ...returnTypeNames] = typeName;
      const outputType = createType(returnTypeNames);
      const inputType = createType(inputTypeName);
      return new FunctionType(inputType, outputType);
    } else {
      return createType(typeName[0]);
    }
  } else {
    if(typeName[0] == typeName[0].toLowerCase()) {
      return new ParametricType(typeName)
    } else {
      return new SingleType(typeName);
    }
  }
}

const isFunction = type => type.isFunctionType()

const isVarType = type => type.isVarType()

function createFunctionType(types) {
  return types.reduceRight((outputType, inputType) => new FunctionType(inputType, outputType))
}

function fullUnappliedType(block) {
  const inputTypes = block.inputList.
    filter(input => input.inputType).
    map(input => input.inputType)
  const outputType = block.outputType

  return createFunctionType([...inputTypes, outputType])
}

function constraints(block) {
  const typeMatches = block.inputList
    .filter(isFullyBlockInput)
    .filter(input => input.inputType)
    .map(input => {
      const expectedType = input.inputType
      const actualType = blockType(input.connection.targetConnection.getSourceBlock())
      return { expected: expectedType, actual: actualType }
  })

  const expectedTypes = typeMatches.map(({expected}) => expected)
  const actualTypes = typeMatches.map(({actual}) => actual)

  const renamedActualTypes = renameTypeMatches(fullUnappliedType(block), actualTypes)

  const constraints = zip(expectedTypes, renamedActualTypes)
                        .flatMap(([expected, actual]) => expected.eqConstraints(actual))

  return constraints
}

function typeVariables(functionBlock) {
  const result = solveConstraints({constraints: constraints(functionBlock), typeDictionary: {}})

  if(result.typeDictionary) {
    return result.typeDictionary
  } else {
    throw new Error(result.error)
  }
}

function getInputType(input) {
  const typeMap = typeVariables(input.getSourceBlock())
  return input.inputType.replacing(typeMap)
}

function getInputTypes(block) {
  return block.inputList
          .filter(isEmptyBlockInput)
          .map(input => getInputType(input))
}

function getOutputType(block) {
  const typeMap = typeVariables(block)
  return block.outputType.replacing(typeMap)
}

function blockType(block) {
  return createFunctionType([...getInputTypes(block), getOutputType(block)])
}
