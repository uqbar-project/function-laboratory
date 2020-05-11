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
  if (this.getParent() && blockType(this).isFunctionType()) {
    this.setCollapsed(true)
  } else {
    this.setCollapsed(false)
  }
  this.setColour(colorShow(this))
}

function onChangeList(event) {
  onChangeValue.bind(this)(event)
  if (this.inputIndex === undefined) { this.inputIndex = 1 }
  if (this.workspace.isDragging()) {
    return;  // Don't change state at the start of a drag.
  }
  const emptyInputs = this.inputList.filter(isEmptyBlockInput)
  if (emptyInputs.length !== 1 || !isEmptyBlockInput(last(emptyInputs))) {
    emptyInputs.forEach(removeInput(this))
    const newInputName = `ELEMENT${this.inputIndex++}`
    appendNewInputList(this, newInputName)
  }
  renameField(this.inputList[0], "[")
}


function setFunctionType(block, ...types) {
  const outputType = createType(types.slice(-1)[0]);
  const inputTypes = types.slice(0, -1).map(type => createType(type));

  inputTypes.forEach((inputType, i) => { block.inputList[i].inputType = inputType });
  block.outputType = outputType;
}

function buildFuctionBlock(name, functionType, fields = []) {

  Blockly.Blocks[name] = {
    init: function () {
      this.appendValueInput(`ARG0`).appendField(fields[0] === undefined ? name : fields[0])
      for (let index = 1; index < functionType.length - 1; index++) {
        const inputName = fields[index] || ""
        this.appendValueInput(`ARG${index}`).appendField(inputName)
      }

      this.setInputsInline(true)
      this.setOutput(true)
      this.setTooltip("")
      this.setHelpUrl("")
      this.setOnChange(onChangeFunction.bind(this))
      setFunctionType(this, ...functionType)
    }
  }

}

const buildInfixFuctionBlock = ([name, field], functionType) => {

  Blockly.Blocks[name] = {
    init: function () {
      this.appendValueInput("LEFT")
      this.appendValueInput("RIGHT")
        .appendField(field)

      this.setInputsInline(true)
      this.setOutput(true)
      this.setTooltip("")
      this.setHelpUrl("")
      this.setOnChange(onChangeFunction.bind(this))
      setFunctionType(this, ...functionType)
    }
  }

}

const newListType = (elementType) => new ListType(createType(elementType))

buildFuctionBlock("even", ["Number", "Boolean"])
buildFuctionBlock("not", ["Boolean", "Boolean"])
buildFuctionBlock("length", ["String", "Number"])//TODO: List(Char)
buildFuctionBlock("charAt", ["Number", "String", "String"])

buildInfixFuctionBlock(["compare", ">"], ["a", "a", "Boolean"])//TODO: Selector
buildInfixFuctionBlock(["apply", "$"], [["a", "b"], "a", "b"])

buildFuctionBlock("id", ["a", "a"])
buildFuctionBlock("composition", [["b", "c"], ["a", "b"], "a", "c"], ["", ".", "$"])

buildInfixFuctionBlock(["at", "!!"], [newListType("a"), "Number", "a"])
buildFuctionBlock("any", [["a", "Boolean"], newListType("a"), "Boolean"])
buildFuctionBlock("all", [["a", "Boolean"], newListType("a"), "Boolean"])
buildFuctionBlock("filter", [["a", "Boolean"], newListType("a"), newListType("a")])
buildFuctionBlock("map", [["a", "b"], newListType("a"), newListType("b")])
buildFuctionBlock("maximum", [newListType("a"), "a"])
buildFuctionBlock("minimum", [newListType("a"), "a"])
buildFuctionBlock("fold", [["a", "b", "a"], "a", newListType("b"), "a"])

Blockly.Blocks['list'] = {
  init: function () {
    this.appendValueInput("ELEMENT")
      .appendField("[")
      .inputType = createType("a")
    this.appendDummyInput("CLOSE")
      .appendField("]")
    this.setInputsInline(true)
    this.setOutput(true, null)
    this.setTooltip("")
    this.setHelpUrl("")
    this.setOnChange(function (event) { onChangeList.bind(this)(event) })
    this.outputType = new ListType(createType("a"))
  },

  /**
   * Create XML to represent the (non-editable) name and arguments.
   * @return {!Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function () {
    var container = document.createElement('mutation')
    this.inputList.filter(isBlockInput).forEach(input => {
      var parameter = document.createElement('arg')
      parameter.setAttribute('name', input.name)
      container.appendChild(parameter)
    })
    return container
  },

  /**
   * Parse XML to restore the (non-editable) name and parameters.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function (xmlElement) {
    this.inputList.forEach(removeInput(this))

    for (var i = 0, childNode; childNode = xmlElement.childNodes[i]; i++) {
      if (childNode.nodeName.toLowerCase() == 'arg') {
        const inputName = childNode.getAttribute('name')
        appendNewInputList(this, inputName)
      }
    }
  },
}

const appendNewInputList = (block, inputName) => {
  block.appendValueInput(inputName)
    .appendField(",")
    .inputType = createType("a")
  block.moveInputBefore(inputName, "CLOSE")
}

Blockly.Blocks["math_arithmetic"].onchange = function (event) {
  setFunctionType(this, "Number", "Number", "Number")
  onChangeFunction.bind(this)(event)
}

Blockly.Blocks["math_number"].onchange = function (event) { onChangeValue.bind(this)(event) }
Blockly.Blocks["math_number"].outputType = createType("Number")

Blockly.Blocks["text"].outputType = createType("String")
Blockly.Blocks["text"].onchange = function (event) { onChangeValue.bind(this)(event) }