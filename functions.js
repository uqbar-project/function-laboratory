class Type {
  matches(otherType) {
    throw "Subclass responsibility"
  }

  matchesFunctionType(aFunctionType) {
    throw "Subclass responsibility"
  }

  matchesSingleType(aSingleType) {
    throw "Subclass responsibility"
  }

  toString() {
    throw "Subclass responsibility"
  }

  parametricMappings(aConcreteType) {
    throw "Subclass responsibility"
  }

  bind(otherType) {
    const myParametricMappings = otherType.parametricMappings(this);
    const otherTypeConcretizedToMe = otherType.concretize(myParametricMappings)
    const theirParametricMappings = this.parametricMappings(otherTypeConcretizedToMe);
    return this.concretize(theirParametricMappings);
  }

  parametricMappingsForFunctionType(aFunctionType) {
    throw "Subclass responsibility"
  }

  parametricMappingsForSingleType(aSingleType) {
    throw "Subclass responsibility"
  }

  parametricMappingsForParametricType(aParametricType) {
    throw "Subclass responsibility"
  }

  concretize(mappingsBetweenTypeVariableToConcreteType) {
    throw "Subclass responsibility"
  }
}

class FunctionType extends Type {
  constructor(inputType, outputType) {
    super();
    this.inputType = inputType;
    this.outputType = outputType;
  }

  matches(otherType) {
    return otherType.bind(this).matchesFunctionType(this);
  }

  matchesFunctionType(otherFunctionType) {
    return this.inputType.matches(otherFunctionType.inputType) && this.outputType.matches(otherFunctionType.outputType);
  }

  matchesSingleType(aSingleType) {
    return false;
  }

  toString() {
    return "(" + this.inputType.toString() + " -> " + this.outputType.toString() + ")";
  }

  canApply(aType, position) {
    return this.inputTypeAtPosition(position).matches(aType);
  }

  parametricMappings(aConcreteType) {
    return aConcreteType.parametricMappingsForFunctionType(this);
  }

  parametricMappingsForFunctionType(aFunctionType) {
    const inputMappings = this.inputType.parametricMappings(aFunctionType.inputType);
    const outputMappings = this.outputType.parametricMappings(aFunctionType.outputType);

    Object.keys(inputMappings).concat(Object.keys(outputMappings)).forEach(t => {
      if(inputMappings[t] && outputMappings[t] && (!inputMappings[t].matches(outputMappings[t]))) {
        throw "No match error, expected " + this.toString() + ", but got " + aFunctionType.toString()
      }
    })

    return {...inputMappings, ...outputMappings}
  }

  parametricMappingsForSingleType(aSingleType) {
    return { };
  }

  parametricMappingsForParametricType(aParametricType) {
    return aParametricType.mappingForConcreteType(this);
  }

  inputTypeAtPosition(position) {
    if(position == 0) {
      return this.inputType;
    } else {
      return this.outputType.inputTypeAtPosition(position - 1);
    }
  }

  validateApplication(expectedType, actualBoundType, originalType) {
    if(!expectedType.matches(actualBoundType)) {
      throw "No match error, expected " + expectedType.toString() + ", but got " + originalType.toString()
    };
  }

  applied(aType, position) {
    const expectedType = this.inputTypeAtPosition(position);

    const actualBoundType = aType.bind(expectedType);

    this.validateApplication(expectedType, actualBoundType, aType);

    const parametricToConcreteMappings = expectedType.parametricMappings(actualBoundType);

    const newType = position == 0 ? this.outputType : new FunctionType(this.inputType, this.outputType.applied(actualBoundType, position - 1))

    return newType.concretize(parametricToConcreteMappings)
  }

  concretize(mappingsBetweenTypeVariableToConcreteType) {
    return new FunctionType(this.inputType.concretize(mappingsBetweenTypeVariableToConcreteType),
                            this.outputType.concretize(mappingsBetweenTypeVariableToConcreteType))
  }
}

class SingleType extends Type {
  constructor(typeName) {
    super();
    this.typeName = typeName;
  }

  matches(otherType) {
    return otherType.matchesSingleType(this);
  }

  matchesFunctionType(aFunctionType) {
    return false;
  }

  matchesSingleType(aSingleType) {
    return this.typeName == aSingleType.typeName;
  }

  toString() {
    return this.typeName;
  }

  apply() {
    throw "Single types can not be applied";
  }

  concretize(mappingsBetweenTypeVariableToConcreteType) {
    return this;
  }

  parametricMappings(aConcreteType) {
    return aConcreteType.parametricMappingsForSingleType(this);
  }

  parametricMappingsForFunctionType(aFunctionType) {
    return {};
  }

  parametricMappingsForSingleType(aSingleType) {
    return {};
  }

  parametricMappingsForParametricType(aParametricType) {
    return aParametricType.mappingForConcreteType(this);
  }
}

class ParametricType extends Type {
  constructor(typeVariableName) {
    super();
    this.typeVariableName = typeVariableName;
  }

  matches(otherType) {
    return true;
  }

  matchesFunctionType(aFunctionType) {
    return true;
  }

  matchesSingleType(aSingleType) {
    return true;
  }

  toString() {
    return this.typeVariableName;
  }

  apply() {
    throw "Parametric type can not be applied";
  }

  concretize(mappingsBetweenTypeVariableToConcreteType) {
    return mappingsBetweenTypeVariableToConcreteType[this.typeVariableName] || new ParametricType(this.typeVariableName + "'");
  }

  parametricMappings(aConcreteType) {
    return aConcreteType.parametricMappingsForParametricType(this);
  }

  parametricMappingsForFunctionType(aFunctionType) {
    return this.mappingForConcreteType(aFunctionType);
  }

  parametricMappingsForSingleType(aSingleType) {
    return this.mappingForConcreteType(aSingleType);
  }

  parametricMappingsForParametricType(aParametricType) {
    return this.mappingForConcreteType(aParametricType);
  }

  mappingForConcreteType(concreteType) {
    const mapping = {};
    mapping[this.typeVariableName] = concreteType;
    return mapping;
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

function bump(block) {
  block.outputConnection.disconnect()
  block.bumpNeighbours()
}

function checkChildrenConnections(block) {
  try {
    currentType(block);
  } catch {
    block.getChildren().reverse().forEach(bump);
  }
}

function onChangeFunction(event) {
  if (this.getParent()) {
    this.setCollapsed(true)
  } else {
    this.setCollapsed(false)
  }

  if (!this.getChildren().length) {
    this.setColour(230)
  } else {
    this.setColour(30)
  }

  checkChildrenConnections(this);
}

const childrenTypesWithIndex = (block) => {
  const typesWithIndexes = []
  block.inputList.forEach((input, i) => {
      if (input.connection && input.connection.targetConnection) {
        typesWithIndexes.push({ childrenType: currentType(input.connection.targetConnection.sourceBlock_), position: i})
      }
    }
  )
  return typesWithIndexes;
}

const currentType = (block) => {
  const childrenTypes = childrenTypesWithIndex(block)

  return childrenTypes.reduce(({timesTypesWereAppliedSoFar, currentType}, {childrenType, position}) =>
  (
    {
      currentType: currentType.applied(childrenType, position - timesTypesWereAppliedSoFar),
      timesTypesWereAppliedSoFar: timesTypesWereAppliedSoFar + 1
    }
  ), {timesTypesWereAppliedSoFar: 0, currentType: block.fullType}).currentType
}

Blockly.Blocks['even'] = {
  init: function () {
    this.appendValueInput("NAME")
      .setCheck("Number")
      .appendField("even");
    this.setInputsInline(true);
    this.setOutput(true, "Boolean");
    this.setColour(230);
    this.setTooltip("");
    this.setHelpUrl("");
    this.setOnChange(onChangeFunction.bind(this));
    this.fullType = createType(["Number", "Boolean"]);
  }
};  

Blockly.Blocks['not'] = {
  init: function () {
    this.appendValueInput("NAME")
      .setCheck("Boolean")
      .appendField("not");
    this.setInputsInline(true);
    this.setOutput(true, "Boolean");
    this.setColour(230);
    this.setTooltip("");
    this.setHelpUrl("");
    this.setOnChange(onChangeFunction.bind(this));
    this.fullType = createType(["Boolean", "Boolean"]);
  }
}

Blockly.Blocks['length'] = {
  init: function () {
    this.appendValueInput("NAME")
      .setCheck("String")
      .appendField("length");
    this.setInputsInline(true);
    this.setOutput(true, "Number");
    this.setColour(230);
    this.setTooltip("");
    this.setHelpUrl("");
    this.setOnChange(onChangeFunction.bind(this));
    this.fullType = createType(["String", "Number"]);
  }
}

Blockly.Blocks['charAt'] = {
  init: function () {
    this.appendValueInput("NAME")
      .setCheck("Number")
      .appendField("charAt");

    this.appendValueInput("NAME")
      .setCheck("String")

    this.setInputsInline(true);
    this.setOutput(true, "String");
    this.setColour(230);
    this.setTooltip("");
    this.setHelpUrl("");
    this.setOnChange(onChangeFunction.bind(this));
    this.fullType = createType(["Number", "String", "String"]);
  }
}

Blockly.Blocks['compare'] = {
  init: function () {
    this.appendValueInput("LEFT")

    this.appendValueInput("RIGHT")
      .appendField(">");//TODO: Selector

    this.setInputsInline(true);
    this.setOutput(true, "Boolean");
    this.setColour(230);
    this.setTooltip("");
    this.setHelpUrl("");
    this.setOnChange(onChangeFunction.bind(this))

    this.fullType = createType(["a", "a", "Boolean"]);
    //Parametric Type
    this.inputList[0].parametricType = 'a'
    this.inputList[1].parametricType = 'a'
  }
}

Blockly.Blocks['id'] = {
  init: function () {
    this.appendValueInput("PARAM")
      .appendField("id");

    this.setInputsInline(true);
    this.setOutput(true);
    this.setColour(230);
    this.setTooltip("");
    this.setHelpUrl("");
    this.setOnChange(onChangeFunction.bind(this))

    //Parametric Type
    this.fullType = createType(["a", "a"]);
    this.inputList[0].parametricType = 'a'
    this.parametricType = 'a'
  }
}

Blockly.Blocks['composition'] = {
  init: function () {
    this.appendValueInput("F2")
      .setCheck(null);
    this.appendValueInput("F1")
      .setCheck(null)
      .appendField(".");
    this.appendValueInput("VALUE")
      .setCheck(null)
      .appendField("$");
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setColour('gray')
    this.setTooltip("");
    this.setHelpUrl("");
    this.setOnChange(onChangeFunction.bind(this))
    this.fullType = createType([["b", "c"], ["a", "b"], "a", "c"]);
  }
};

Blockly.Blocks["math_number"].fullType = createType("Number")

Blockly.Blocks["math_arithmetic"].fullType = createType(["Number", "Number", "Number"])
Blockly.Blocks["math_arithmetic"].onchange = function (event) { onChangeFunction.bind(this)(event) }

Blockly.Blocks["text"].fullType = createType("String")
