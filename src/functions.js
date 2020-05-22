const errorReporter = {
  report: function (error) {
    alert(error)
  }
}

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
  if (this.workspace.isDragging()) {
    return;  // Don't change state at the start of a drag.
  }
  organizeList(this)
}


function setFunctionType(block, ...types) {
  const outputType = createType(types.slice(-1)[0]);
  const inputTypes = types.slice(0, -1).map(type => createType(type));

  inputTypes.forEach((inputType, i) => { block.inputList[i].inputType = inputType });
  block.outputType = outputType;
}

function buildFuctionBlockWith(name, functionType, cb) {
  Blockly.Blocks[name] = {
    init: function () {
      cb(this)
      this.setInputsInline(true)
      this.setOutput(true)
      this.setOnChange(onChangeFunction.bind(this))
      setFunctionType(this, ...functionType)
      this.setTooltip(blockType(this).toString())
      this.setHelpUrl("")
    },
    reduce() {
      const result = this.getResultBlock()
      if (result.error) {
        errorReporter.report(result.error)
      } else {
        reduceBlock(this)(result.block)
      }
    },
    generateContextMenu: function () {
      return [{
        text: "Reducir",
        callback: this.reduce.bind(this),
        enabled: !blockType(this).isFunctionType() && this.getResultBlock,
      }, ...this.__proto__.generateContextMenu.bind(this)()]
    }
  }
}

const getResultBlockDefault = function () { return { block: this } }

const buildFuctionBlock = ({ name, type, fields = [], getResultBlock = getResultBlockDefault }) =>
  buildFuctionBlockWith(name, type, block => {
    block.appendValueInput(`ARG0`).appendField(fields[0] === undefined ? name : fields[0])
    for (let index = 1; index < type.length - 1; index++) {
      const inputName = fields[index] || ""
      block.appendValueInput(`ARG${index}`).appendField(inputName)
    }
    block.getResultBlock = getResultBlock
  })

const buildInfixFuctionBlock = ([name, field], functionType) =>
  buildFuctionBlockWith(name, functionType, block => {
    block.appendValueInput("LEFT")
    block.appendValueInput("RIGHT")
      .appendField(field)
  })

function decorateInit(block, initExtension) {
  const oldInit = block.init
  function newInit() {
    oldInit.bind(this)();
    initExtension.bind(this)();
  }
  block.init = newInit
}

const reduceBlock = expandedBlock => reducedBlock => {
  reducedBlock.setEditable(false)
  expandedBlockAsXml = Blockly.Xml.blockToDom(expandedBlock)
  reducedBlock.generateContextMenu = function () {
    return [{
      text: "Expandir",
      callback: function () {
        const restoredOldBlock = Blockly.Xml.domToBlock(expandedBlockAsXml, reducedBlock.workspace)
        replace(reducedBlock)(restoredOldBlock)
      },
      enabled: true
    }, ...reducedBlock.__proto__.generateContextMenu.bind(this)()]
  }

  replace(expandedBlock)(reducedBlock)
}

const replace = oldBlock => newBlock => {
  newBlock.initSvg()
  newBlock.moveTo(oldBlock.getRelativeToSurfaceXY())
  oldBlock.dispose()
  newBlock.render()
}

const newListType = elementType => new ListType(createType(elementType))

const argFieldValue = (block, arg = 0) => field =>
  block.getInput(`ARG${arg}`).connection.targetBlock().getResultBlock().block.getFieldValue(field)

buildFuctionBlock({
  name: "even",
  type: ["Number", "Boolean"],
  getResultBlock: function () {
    const result = argFieldValue(this)("NUM") % 2 == 0
    return { block: newBoolean(this.workspace, result) }
  }
})
buildFuctionBlock({
  name: "not",
  type: ["Boolean", "Boolean"],
  getResultBlock: function () {
    const result = argFieldValue(this)("BOOL") == "FALSE"
    return { block: newBoolean(this.workspace, result) }
  }
})
buildFuctionBlock({
  name: "length",
  type: ["String", "Number"],
  getResultBlock: function () {
    const result = argFieldValue(this)("TEXT").length
    return { block: newNumber(this.workspace, result) }
  }
})//TODO: List(Char)
buildFuctionBlock({
  name: "charAt",
  type: ["Number", "String", "String"],
  getResultBlock: function () {
    const position = argFieldValue(this, 0)("NUM")
    const string = argFieldValue(this, 1)("TEXT")
    const result = string[position]
    if (result != null) {
      return { block: newString(this.workspace, result) }
    } else {
      return ({ error: "Out of bounds position" })
    }
  }
})

buildInfixFuctionBlock(["compare", ">"], ["a", "a", "Boolean"])//TODO: Selector
buildInfixFuctionBlock(["apply", "$"], [["a", "b"], "a", "b"])

buildFuctionBlock({
  name: "id",
  type: ["a", "a"],
  getResultBlock: function () {
    const xmlBlock = Blockly.Xml.blockToDom(this.getChildren()[0])
    const copiedBlock = Blockly.Xml.domToBlock(xmlBlock, this.workspace)
    return { block: copiedBlock }
  }
})
buildFuctionBlock({
  name: "composition",
  type: [["b", "c"], ["a", "b"], "a", "c"],
  fields: ["", ".", "$"]
})

buildInfixFuctionBlock(["at", "!!"], [newListType("a"), "Number", "a"])
buildFuctionBlock({
  name: "any",
  type: [["a", "Boolean"], newListType("a"), "Boolean"]
})
buildFuctionBlock({
  name: "all",
  type: [["a", "Boolean"], newListType("a"), "Boolean"]
})
buildFuctionBlock({
  name: "filter",
  type: [["a", "Boolean"],
  newListType("a"),
  newListType("a")]
})
buildFuctionBlock({
  name: "map",
  type: [["a", "b"], newListType("a"), newListType("b")]
})
buildFuctionBlock({
  name: "maximum",
  type: [newListType("a"), "a"]
})
buildFuctionBlock({
  name: "minimum",
  type: [newListType("a"), "a"]
})
buildFuctionBlock({
  name: "fold",
  type: [["a", "b", "a"], "a", newListType("b"), "a"]
})

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
    this.inputIndex = 1
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


Blockly.Blocks["math_arithmetic"].onchange = function (event) {
  setFunctionType(this, "Number", "Number", "Number")
  onChangeFunction.bind(this)(event)
}

function decorateValueBlock(name, type) {
  Blockly.Blocks[name].onchange = function (event) { onChangeValue.bind(this)(event) }
  Blockly.Blocks[name].outputType = createType(type)
  decorateInit(Blockly.Blocks[name], function () { this.getResultBlock = getResultBlockDefault })
}

decorateValueBlock("math_number", "Number")
decorateValueBlock("text", "String")
decorateValueBlock("logic_boolean", "Boolean")

