function applyEven(functionBlock) {
  functionBlock.setColour(30);
  functionBlock.getChildren().forEach((it) => it.setColour(30))
}

const isFunction = (type) => type.includes("->")

const asFunctionType = (...types) => types.join('->')

const functionTypeToList = (functionType) => functionType.split('->')

const isBlockInput = (input) => input.type === 1

const isEmptyInput = (input) => !input.connection.targetConnection

function functionType(functionBlock) {
  const inputTypes = functionBlock.inputList
    .filter(input => isBlockInput(input) && isEmptyInput(input))
    .map(input => getType(input.connection))
  return asFunctionType(...inputTypes, getType(functionBlock.outputConnection))
}

function outputFunctionType(functionBlock) {
  const type = functionType(functionBlock)
  if (!isFunction(type)) return null
  return asFunctionType(...functionTypeToList(type).slice(1))
}

function getType(connection) {
  return connection.getCheck() && connection.getCheck()[0] || 'Any'
}

function bump(block) {
  block.outputConnection.disconnect()
  block.bumpNeighbours()
}

function checkConnections(functionBlock) {
  if (functionBlock.outputConnection.targetConnection && !functionBlock.outputConnection.targetConnection.checkType({ check_: [functionType(functionBlock)] })) {
    bump(functionBlock)
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
  checkConnections(this)
}

function checkFunction(functionBlock) {
  if (!isFunction(functionType(functionBlock))) {
    bump(functionBlock)
  }
}

function matchCompositionType(block1, block2) {
  return block1.inputList[0].connection.checkType({ check_: [outputFunctionType(block2)] })
}

function matchApplyType(block1, block2) {
  return block1.inputList[0].connection.checkType({ check_: [functionType(block2)] })
}

function checkCompositionParam(param) {
  if (param) {
    checkFunction(param)
  }
}

function checkComposition(block1, block2) {
  if (!matchCompositionType(block1, block2)) {
    bump(block1)
    bump(block2)
  }
}

function checkApply(block1, block2) {
  if (!matchApplyType(block1, block2)) {
    bump(block2)
  }
}

function onChangeComposition(event) {
  const f1 = this.inputList[0].connection.targetBlock()
  const f2 = this.inputList[1].connection.targetBlock()
  const value = this.inputList[2].connection.targetBlock()

  checkCompositionParam(f1)
  checkCompositionParam(f2)

  if (f1 && f2) {
    checkComposition(f1, f2)
  }
  if (f2 && value) {
    checkApply(f2, value)
  }
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
    this.setOnChange(onChangeFunction.bind(this))
  }
}

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
    this.setOnChange(onChangeFunction.bind(this))
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
    this.setOutput(true, "Boolean");
    this.setColour(230);
    this.setTooltip("");
    this.setHelpUrl("");
    this.setOnChange(onChangeFunction.bind(this))
  }
}

Blockly.Blocks['compare'] = {
  init: function () {
    this.appendValueInput("NAME")
      .setCheck("Number")
      
    this.appendValueInput("NAME")
      .setCheck("Number")
      .appendField(">");//TODO: Selector

    this.setInputsInline(true);
    this.setOutput(true, "Boolean");
    this.setColour(230);
    this.setTooltip("");
    this.setHelpUrl("");
    this.setOnChange(onChangeFunction.bind(this))
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
    this.setOnChange(onChangeComposition.bind(this))
  }
};

Blockly.Blocks["math_arithmetic"].onchange = function (event) { onChangeFunction.bind(this)(event) }
Blockly.Blocks["math_number"].onchange = function (event) {
  if (event.blockId == this.id) {
    if (!this.getParent()) {
      this.setColour(230)
    } else {
      this.setColour(30)
    }

  }
}
