class Type {
  allTypeVariableNamesUsed(otherType) {
    throw "Subclass responsibility"
  }

  includes(parametricType) {
    throw "Subclass responsibility"
  }

  eqConstraints(otherType) {
    throw "Subclass responsibility"
  }

  replacing(typeMap) {
    throw "Subclass responsibility"
  }

  restrictToSimple(type) {
    throw "Subclass responsibility"
  }

  restrictToComposite(type) {
    throw "Subclass responsibility"
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

class EstructuralType extends Type {
  constructor(name, attributes) {
    super();
    this.name = name
    this.attributes = attributes
  }

  attributeValues() { return Object.values(this.attributes) }

  allTypeVariableNamesUsed() {
    return this.attributeValues().flatMap(type => type.allTypeVariableNamesUsed())
  }

  includes(parametricType) { //TODO: Revisar esto
    const typeVariableName = parametricType.typeVariableName
    return this.attributeValues().some(type => type.typeVariableName == typeVariableName || type.includes(parametricType))
  }

  restrictToSimple(type) {
    throw typeError(type, this)
  }

  restrictToComposite(type) { //TODO: Mover a constraints
    this.validateTypeRestriction(type)
    const constraints = Object.values(zipObjects(type.attributes, this.attributes)).flatMap(([type1, type2]) => type1.eqConstraints(type2))
    const result = solveConstraints({ constraints })
    if (result.error) throw result.error
    return result.typeDictionary
  }

  validateTypeRestriction(type) {
    if (this.name != type.name) throw typeError(type, this)
    if (!hasSameKeys(this.attributes, type.attributes)) throw typeError(type, this)
  }

  eqConstraints(otherType) {
    return [new CompositeEqConstraint(this, otherType)]
  }

  toColor(typeColors) {
    var colorList =  this.attributeValues().map(type => type.toColor(typeColors))
    colorList = [colorForType(this.name)].concat(colorList)
    return combineColors(colorList)
  }
}

class FunctionType extends EstructuralType {
  constructor(inputType, outputType) {
    super('Function', { inputType, outputType })
    this.inputType = inputType
    this.outputType = outputType
  }

  isFunctionType() {
    return true
  }

  replacing(typeMap) {
    return new FunctionType(this.inputType.replacing(typeMap), this.outputType.replacing(typeMap))
  }

  toStringAsInput() {
    return "(" + this.toString() + ")"
  }

  toString() {
    return this.inputType.toStringAsInput() + " -> " + this.outputType.toString()
  }

}

class ListType extends EstructuralType {
  constructor(elementType) {
    super('List', { elementType })
    this.elementType = elementType
  }

  replacing(typeMap) {
    return new ListType(this.elementType.replacing(typeMap))
  }

  toString() {
    return `[${this.elementType.toString()}]`
  }

}

class SingleType extends Type {
  constructor(typeName) {
    super();
    this.typeName = typeName;
  }

  allTypeVariableNamesUsed() {
    return []
  }

  includes(parametricType) {
    return false
  }

  replacing(typeMap) {
    return this
  }

  //TODO: Simple or Single?
  restrictToSimple(type) {
    if (type.typeName == this.typeName) return {} //TODO: Mover esto a las constraint
    throw typeError(type, this)
  }

  restrictToComposite(type) {
    throw typeError(type, this)
  }

  eqConstraints(otherType) {
    return [new SimpleEqConstraint(this, otherType)]
  }

  toString() {
    return this.typeName;
  }

  toColor(typeColors) {
    return colorForType(this.typeName)
  }
}

class ParametricType extends Type {
  constructor(typeVariableName) {
    super();
    this.typeVariableName = typeVariableName;
  }

  allTypeVariableNamesUsed() {
    return [this.typeVariableName]
  }

  includes(parametricType) {
    return false
  }

  replacing(typeMap) {
    return typeMap[this.typeVariableName] || this
  }

  restrictToSimple(type) {
    return this.restrict(type)
  }

  restrictToComposite(type) {
    return this.restrict(type)
  }

  restrict(type) {
    return { [this.typeVariableName]: type }
  }

  eqConstraints(otherType) {
    return [new ParametricEqConstraint(this, otherType)]
  }

  toString() {
    return this.typeVariableName;
  }

  toColor(typeColors) {
    return typeColors['Any']
  }
}

const createType = (typeName) => {
  if (Type.isPrototypeOf(typeName.constructor)) return typeName
  if (Array.isArray(typeName)) {
    if (typeName.length > 1) {
      const [inputTypeName, ...returnTypeNames] = typeName
      const outputType = createType(returnTypeNames)
      const inputType = createType(inputTypeName)
      return new FunctionType(inputType, outputType)
    } else {
      return createType(typeName[0])
    }
  } else {
    if (typeName[0] == typeName[0].toLowerCase()) {
      return new ParametricType(typeName)
    } else {
      return new SingleType(typeName)
    }
  }
}

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

  const expectedTypes = typeMatches.map(({ expected }) => expected)
  const actualTypes = typeMatches.map(({ actual }) => actual)

  const renamedActualTypes = renameTypeMatches(fullUnappliedType(block), actualTypes)

  const constraints = zip(expectedTypes, renamedActualTypes)
    .flatMap(([expected, actual]) => expected.eqConstraints(actual))

  return constraints
}

function blockConstraints(functionBlock) {
  try {
    return solveConstraints({ constraints: constraints(functionBlock), typeDictionary: {} })
  } catch(error) {
    return { error: error.message }
  }
}

function typeVariables(functionBlock) {
  const result = blockConstraints(functionBlock)
  if (result.error) throw new Error(result.error)
  return result.typeDictionary
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
  if (block.type == 'list') //TODO
    return getOutputType(block)
  else
    return createFunctionType([...getInputTypes(block), getOutputType(block)])
}
