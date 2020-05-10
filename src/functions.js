function onChangeValue(event) {
  if (event.blockId == this.id) {
    checkParentConnection(this)
  }
  this.setColour(colorShow(this))
}

function onChangeFunction(event) {
  if (event.blockId == this.id) {
    checkParentConnection(this)
  }
  if (this.getParent() && blockType(this).isFunctionType()) { //TODO: Remove isFunctionType() when this change
    this.setCollapsed(true)
  } else {
    this.setCollapsed(false)
  }
  this.setColour(colorShow(this))
}

function onChangeList(event) {
  onChangeValue.bind(this)(event)

  //TODO: Fix
  if (event.newParentId == this.id || event.oldParentId == this.id) {
    const lastDummyInput = this.inputList[this.inputList.length - 1]
    // const lastBlockInput = this.inputList[this.inputList.length - 2]
    const emptyInputs = this.inputList.filter(isEmptyBlockInput)
    if (emptyInputs.length !== 1) {
      emptyInputs.forEach(input => {
        input.connection.disconnect()
        input.dispose()
      })
      lastDummyInput.dispose()

      this.appendValueInput(`ELEMENT${this.inputList.length}`)
        .appendField(",")
        .inputType = createType("a")

      this.appendDummyInput("")
        .appendField("]")
    }
  }
}


function setFunctionType(block, ...types) {
  const outputType = createType(types.slice(-1)[0]);
  const inputTypes = types.slice(0, -1).map(type => createType(type));

  inputTypes.forEach((inputType, i) => { block.inputList[i].inputType = inputType });
  block.outputType = outputType;
}

Blockly.Blocks['even'] = {
  init: function () {
    this.appendValueInput("NAME")
      .appendField("even");
    this.setInputsInline(true);
    this.setOutput(true);
    this.setColour(230);
    this.setTooltip("");
    this.setHelpUrl("");
    this.setOnChange(onChangeFunction.bind(this))

    setFunctionType(this, "Number", "Boolean")
  }
}

Blockly.Blocks['not'] = {
  init: function () {
    this.appendValueInput("NAME")
      .appendField("not");
    this.setInputsInline(true);
    this.setOutput(true);
    this.setColour(230);
    this.setTooltip("");
    this.setHelpUrl("");
    this.setOnChange(onChangeFunction.bind(this))

    setFunctionType(this, "Boolean", "Boolean")
  }
}

Blockly.Blocks['length'] = {
  init: function () {
    this.appendValueInput("NAME")
      .appendField("length");
    this.setInputsInline(true);
    this.setOutput(true);
    this.setColour(230);
    this.setTooltip("");
    this.setHelpUrl("");
    this.setOnChange(onChangeFunction.bind(this))

    setFunctionType(this, "String", "Number")
  }
}

Blockly.Blocks['charAt'] = {
  init: function () {
    this.appendValueInput("NAME")
      .appendField("charAt");

    this.appendValueInput("NAME")

    this.setInputsInline(true);
    this.setOutput(true);
    this.setColour(230);
    this.setTooltip("");
    this.setHelpUrl("");
    this.setOnChange(onChangeFunction.bind(this))

    setFunctionType(this, "Number", "String", "String")
  }
}

Blockly.Blocks['compare'] = {
  init: function () {
    this.appendValueInput("LEFT")

    this.appendValueInput("RIGHT")
      .appendField(">");//TODO: Selector

    this.setInputsInline(true);
    this.setOutput(true);
    this.setColour(230);
    this.setTooltip("");
    this.setHelpUrl("");
    this.setOnChange(onChangeFunction.bind(this))

    //Parametric Type
    setFunctionType(this, "a", "a", "Boolean")
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
    setFunctionType(this, "a", "a")
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

    setFunctionType(this, ["b", "c"], ["a", "b"], "a", "c")
  }
};

Blockly.Blocks['apply'] = {
  init: function () {
    this.appendValueInput("function")
      .setCheck(null)
    this.appendValueInput("VALUE")
      .setCheck(null)
      .appendField("$");
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setColour('gray')
    this.setTooltip("");
    this.setHelpUrl("");
    this.setOnChange(onChangeFunction.bind(this))

    setFunctionType(this, ["a", "b"], "a", "b")
  }
}

Blockly.Blocks['list'] = {
  init: function () {
    this.appendValueInput("ELEMENT")
      .appendField("[")
      .inputType = createType("a")
    this.appendDummyInput("")
      .appendField("]")
    this.setInputsInline(true)
    this.setOutput(true, null)
    this.setTooltip("")
    this.setHelpUrl("")
    this.setOnChange(function (event) { onChangeList.bind(this)(event) })
    this.outputType = new ListType(createType("a"))
  }
}

Blockly.Blocks["math_arithmetic"].onchange = function (event) {
  setFunctionType(this, "Number", "Number", "Number")
  onChangeFunction.bind(this)(event)
}

Blockly.Blocks["math_number"].onchange = function (event) { onChangeValue.bind(this)(event) }
Blockly.Blocks["math_number"].outputType = createType("Number")

Blockly.Blocks["text"].outputType = createType("String")
Blockly.Blocks["text"].onchange = function (event) { onChangeValue.bind(this)(event) }