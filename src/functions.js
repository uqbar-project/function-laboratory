function onChangeValue(event) {
  if (event.blockId == this.id) {
    checkParentConnection(this)
  }
  this.setColour(colorShow(this))
}

function onChangeFunction(event) {
  if (this.getParent()) {
    this.setCollapsed(true) //TODO: Always?
  } else {
    this.setCollapsed(false)
  }
  checkParentConnection(this)
  this.setColour(colorShow(this))
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
    this.setOutput(true, "String");
    this.setColour(230);
    this.setTooltip("");
    this.setHelpUrl("");
    this.setOnChange(onChangeFunction.bind(this))
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
    this.setOnChange(onChangeComposition.bind(this))
  }
};

Blockly.Blocks["math_arithmetic"].onchange = function (event) { onChangeFunction.bind(this)(event) }
Blockly.Blocks["math_number"].onchange = function (event) { onChangeValue.bind(this)(event) }
Blockly.Blocks["text"].onchange = function (event) { onChangeValue.bind(this)(event) }