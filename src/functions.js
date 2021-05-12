function onChangeBlock(event) {
  if (event.blockId == this.id && !this.workspace.isDragging()) {
    checkParentConnection(this)
  }
  if (!blockConstraints(this).error) {
    this.setColour(colorShow(this))
    this.setTooltip(blockType(this).toString())
  }
}

function onChangeValue(event) {
  onChangeBlock.call(this, event)
}

function onChangeFunction(event) {
  onChangeBlock.call(this, event)
  if (this.getParent() && blockType(this).isFunctionType()) {
    this.setCollapsed(true)
  } else {
    this.setCollapsed(false)
  }
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
      this.setHelpUrl("")
    },
    reduce() {
      try {
        if (blockType(this).isFunctionType()) {
          throw new Error("Falta aplicar parametros para reducir esta expresion")
        }
        const newBlock = this.createReducedBlock()
        replace(this)(newBlock)
      } catch (error) {
        if (error instanceof Error) {
          errorReporter.report(error.message)
        } else {
          throw error;
        }
      }
    },
    createReducedBlock() {
      const reducedBlock = valueToBlock(this.workspace, this.getValue())

      configureAsNonEditable(reducedBlock)
      configureToExpandTo(reducedBlock)(this)

      return reducedBlock
    },
    getValue() {
      const paramCount = this.inputList.filter(isBlockInput).length
      const args = Array(paramCount).fill()
        .map((_, i) => argBlock(this, i))
        .map(x => x === null ? ___ : x.getValue())
        .filter(argBlock => argBlock !== undefined)

      const result = partialApply(...args)(this.compile)
      return result;
    },
    generateContextMenu: function () {
      return [{
        text: "Reducir",
        callback: this.reduce.bind(this),
        enabled: !blockType(this).isFunctionType() && this.compile,
      }, ...this.__proto__.generateContextMenu.bind(this)()]
    }
  }
}

const configureAsNonEditable = block => {
  block.setEditable(false)
  block.getChildren().forEach(child => child.setEditable(false))
}

const configureToExpandTo = reducedBlock => expandedBlock => {
  const expandedBlockAsXml = Blockly.Xml.blockToDom(expandedBlock)

  reducedBlock.expand = function () {
    const restoredOldBlock = Blockly.Xml.domToBlock(expandedBlockAsXml, reducedBlock.workspace)
    replace(reducedBlock)(restoredOldBlock)
  }

  reducedBlock.generateContextMenu = function () {
    return [{
      text: "Expandir",
      callback: reducedBlock.expand,
      enabled: true
    }, ...reducedBlock.__proto__.generateContextMenu.bind(this)()]
  }
}

const buildFuctionBlock = ({ name, type, compile, fields = [] }) =>
  buildFuctionBlockWith(name, type, block => {
    block.compile = compile
    block.appendValueInput(`ARG0`).appendField(fields[0] === undefined ? name : fields[0])
    for (let index = 1; index < type.length - 1; index++) {
      const inputName = fields[index] || ""
      block.appendValueInput(`ARG${index}`).appendField(inputName)
    }
  })

const buildInfixFuctionBlock = ([name, field], functionType) =>
  buildFuctionBlockWith(name, functionType, block => {
    block.appendValueInput("ARG0")
    block.appendValueInput("ARG1")
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

const replace = oldBlock => newBlock => {
  newBlock.initSvg()
  newBlock.moveTo(oldBlock.getRelativeToSurfaceXY())
  oldBlock.dispose()
  newBlock.render()
  newBlock.getChildren().forEach(child => {
    child.initSvg()
    child.render()
  })
}

const newListType = elementType => new ListType(createType(elementType))

const argBlock = (block, arg = 0) => {
  const input = block.getInput(`ARG${arg}`)
  return input && input.connection.targetBlock()
}

const allArgBlocks = block =>
  Array(block.inputList.length).fill().map((_, i) => argBlock(block, i))

buildFuctionBlock({
  name: "even",
  type: ["Number", "Boolean"],
  compile: (n) => n % 2 == 0
})
buildFuctionBlock({
  name: "not",
  type: ["Boolean", "Boolean"],
  compile: (bool) => !bool
})
buildFuctionBlock({
  name: "length",
  type: ["String", "Number"],
  compile: (string) => string.length
})//TODO: List(Char)
buildFuctionBlock({
  name: "charAt",
  type: ["Number", "String", "String"],
  compile: (position) => (string) => {
    const char = string[position];
    if (char == null) { throw new Error("Posición fuera de límites") }
    return char;
  }
})

buildInfixFuctionBlock(["compare", ">"], ["a", "a", "Boolean"])//TODO: Selector
buildInfixFuctionBlock(["apply", "$"], [["a", "b"], "a", "b"])

decorateInit(Blockly.Blocks["apply"], function () {
  this.compile = (f) => (x) => f(x)
})

buildFuctionBlock({
  name: "id",
  type: ["a", "a"],
  compile: (x) => x,
})
buildFuctionBlock({
  name: "composition",
  type: [["b", "c"], ["a", "b"], "a", "c"],
  fields: ["", ".", "$"],
  compile: (f2) => (f1) => (value) => {
    return f2(f1(value))
  }
})

buildInfixFuctionBlock(["at", "!!"], [newListType("a"), "Number", "a"])
buildFuctionBlock({
  name: "any",
  type: [["a", "Boolean"], newListType("a"), "Boolean"],
  compile: (condition) => (list) => list.some(condition)
})
buildFuctionBlock({
  name: "all",
  type: [["a", "Boolean"], newListType("a"), "Boolean"],
  compile: (condition) => (list) => list.every(condition)
})
buildFuctionBlock({
  name: "filter",
  type: [["a", "Boolean"],
  newListType("a"),
  newListType("a")],
  compile: (condition) => (list) => list.filter(condition)
})
buildFuctionBlock({
  name: "map",
  type: [["a", "b"], newListType("a"), newListType("b")],
  compile: (f) => (list) => list.map(f)
})
buildFuctionBlock({
  name: "maximum",
  type: [newListType("a"), "a"],
  compile: (list) => {
    if (!list.length) { throw new Error("La lista está vacía") }
    return list.reduce((a, b) => a > b ? a : b)
  }
})
buildFuctionBlock({
  name: "minimum",
  type: [newListType("a"), "a"],
  compile: (list) => {
    if (!list.length) { throw new Error("La lista está vacía") }
    return list.reduce((a, b) => a < b ? a : b)
  }
})
buildFuctionBlock({
  name: "fold",
  type: [["a", "b", "a"], "a", newListType("b"), "a"],
  compile: (f) => (seed) => (list) => list.reduce((x, y) => f(x)(y), seed)
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
    this.setHelpUrl("")
    this.setOnChange(function (event) { onChangeList.bind(this)(event) })
    this.outputType = new ListType(createType("a"))
    this.inputIndex = 1
    this.getValue = () => this.getChildren().map(element => element.getValue())
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
  onChangeFunction.bind(this)(event)
}

decorateInit(Blockly.Blocks["math_arithmetic"], function () {
  setFunctionType(this, "Number", "Number", "Number")
  this.getValue = () => {
    const op = ({
      "ADD": x => y => x + y,
      "MINUS": x => y => x - y,
      "MULTIPLY": x => y => x * y,
      "DIVIDE": x => y => x / y,
      "POWER": x => y => Math.pow(x, y),
    })[this.getField("OP").getValue()]
    var a = this.getInput("A").connection.targetBlock() && this.getInput("A").connection.targetBlock().getValue()
    var b = this.getInput("B").connection.targetBlock() && this.getInput("B").connection.targetBlock().getValue()
    if (a == null) { a = ___ }
    if (b == null) { b = ___ }
    return partialApply(a, b)(op)
  }
})

function decorateValueBlock(name, type, getValue) {
  Blockly.Blocks[name].onchange = function (event) { onChangeValue.bind(this)(event) }
  Blockly.Blocks[name].outputType = createType(type)
  decorateInit(Blockly.Blocks[name], function () {
    this.getValue = getValue(this)
  })
}

decorateValueBlock("math_number", "Number", (block) => () => block.getFieldValue("NUM"))
decorateValueBlock("text", "String", (block) => () => block.getFieldValue("TEXT"))
decorateValueBlock("logic_boolean", "Boolean", (block) => () => {
  const valueName = block.getFieldValue("BOOL");
  if (valueName == "TRUE") { return true };
  if (valueName == "FALSE") { return false };
  throw new Error("Booleano inicializado con un valor invalido");
})

