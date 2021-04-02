function onChangeBlock(event) {
  if (event.blockId == this.id) {
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
    getReduction(...args) {
      if(!(name != "charAt" && name != "length" && name != "not" && name != "even" && name != "composition" && name != "fold")) {
        try {
          return { block: newValue(this.workspace, this.getValue()) }
        } catch (error) {
          if(error instanceof Error) {
            return ({ error: error.message });
          } else {
            throw error;
          }
        }
      }
      const paramCount = this.inputList.filter(isBlockInput).length
      const stackArgs = args.reverse()
      const allArgs = Array(paramCount).fill()
        .map((_, i) => argBlock(this, i) || stackArgs.pop())
        .filter(argBlock => argBlock !== undefined)
      return this.getResultBlock(...allArgs)
    },
    getResultBlock: function (...blocks) {
      if(blocks.length === 0) { return { block: this } };
      const valueArgs = blocks.map(block => block.getValue());
  
      try {
        const result = valueArgs.reduce((f, x) => f(x), this.evaluation);
        return { block: newValue(this.workspace, result) }
      } catch (error) {
        if(error instanceof Error) {
          return ({ error: error.message });
        } else {
          throw error;
        }
      }
    },
    reduce() {
      if(blockType(this).isFunctionType()) {
        throw new Error("Falta aplicar parametros para reducir esta expresion")
      }
      const result = this.getReduction()
      if (result.error) {
        errorReporter.report(result.error)
      } else {
        reduceBlock(this)(result.block)
      }
    },
    getValue() {
      const paramCount = this.inputList.filter(isBlockInput).length
      const args = Array(paramCount).fill()
        .map((_, i) => argBlock(this, i))
        .map(x => x === null ? ___ : x.getValue())
        .filter(argBlock => argBlock !== undefined)

      const result = partialApply(...args)(this.evaluation)
      return result;
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

const flip = f => x => y => f(y)(x)

const getResultBlockDefault = function () { return { block: this } }

const buildFuctionBlock = ({ name, type, evaluation = () => {}, fields = [], getResultBlock = getResultBlockDefault }) =>
  buildFuctionBlockWith(name, type, block => {
    block.evaluation = evaluation
    block.appendValueInput(`ARG0`).appendField(fields[0] === undefined ? name : fields[0])
    for (let index = 1; index < type.length - 1; index++) {
      const inputName = fields[index] || ""
      block.appendValueInput(`ARG${index}`).appendField(inputName)
    }
    if(name != "charAt" && name != "length" && name != "not" && name != "even" && name != "composition" && name != "fold") {
      block.getResultBlock = getResultBlock
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

const reduceBlock = expandedBlock => reducedBlock => {
  // Result blocks are not editable
  reducedBlock.setEditable(false)
  reducedBlock.getChildren().forEach(child => child.setEditable(false))
  reducedBlock.expand = function () {
    const restoredOldBlock = Blockly.Xml.domToBlock(expandedBlockAsXml, reducedBlock.workspace)
    replace(reducedBlock)(restoredOldBlock)
  }

  expandedBlockAsXml = Blockly.Xml.blockToDom(expandedBlock)
  reducedBlock.generateContextMenu = function () {
    return [{
      text: "Expandir",
      callback: reducedBlock.expand,
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

const resultFieldValue = (block, field) =>
  withReducedBlockDo(block, (reducedBlock) => reducedBlock.getFieldValue(field))

const withReducedBlockDo = (expandedBlock, action) => {
  const reducedBlock = expandedBlock.getReduction().block

  const result = action(reducedBlock)

  if (reducedBlock != expandedBlock) { reducedBlock.dispose() } // Dispose intermediate result blocks

  return result
}

buildFuctionBlock({
  name: "even",
  type: ["Number", "Boolean"],
  evaluation: (n) => n % 2 == 0
})
buildFuctionBlock({
  name: "not",
  type: ["Boolean", "Boolean"],
  evaluation: (bool) => !bool
})
buildFuctionBlock({
  name: "length",
  type: ["String", "Number"],
  evaluation: (string) => string.length
})//TODO: List(Char)
buildFuctionBlock({
  name: "charAt",
  type: ["Number", "String", "String"],
  evaluation: (position) => (string) => {
    const char = string[position];
    if(char == null) { throw new Error("Posición fuera de límites") }
    return char;
  }
})

buildInfixFuctionBlock(["compare", ">"], ["a", "a", "Boolean"])//TODO: Selector
buildInfixFuctionBlock(["apply", "$"], [["a", "b"], "a", "b"])

decorateInit(Blockly.Blocks["apply"], function () {
  this.evaluation = (f) => (x) => f(x)
})

buildFuctionBlock({
  name: "id",
  type: ["a", "a"],
  evaluation: (x) => x,
  getResultBlock: function (arg) {
    return { block: copyBlock(this.workspace, arg) }
  }
})
buildFuctionBlock({
  name: "composition",
  type: [["b", "c"], ["a", "b"], "a", "c"],
  fields: ["", ".", "$"],
  evaluation: (f2) => (f1) => (value) => {
    return f2(f1(value))
  }
})

buildInfixFuctionBlock(["at", "!!"], [newListType("a"), "Number", "a"])
buildFuctionBlock({
  name: "any",
  type: [["a", "Boolean"], newListType("a"), "Boolean"],
  getResultBlock: function (condition, list) {
    const result = allListElements(list).some(e => condition.getValue()(e))
    return { block: newBoolean(this.workspace, result) }
  }
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
  type: [["a", "b"], newListType("a"), newListType("b")],
  getResultBlock: function (transform, list) {
    const result = allListElements(list).map(e => transform.getValue()(e.getValue()))
    return { block: newList(this.workspace, result) }
  }
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
  type: [["a", "b", "a"], "a", newListType("b"), "a"],
  evaluation: (f) => (seed) => (list) => list.reduce((x, y) => f(x)(y), seed)
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
    this.getResultBlock = getResultBlockDefault
    this.getReduction = getResultBlockDefault
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

decorateInit(Blockly.Blocks["math_arithmetic"], function () {
  this.getResultBlock = getResultBlockDefault
  this.getReduction = getResultBlockDefault
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
    this.getResultBlock = getResultBlockDefault
    this.getReduction = getResultBlockDefault
    this.getValue = getValue(this)
  })
}

decorateValueBlock("math_number", "Number", (block) => () => resultFieldValue(block, "NUM"))
decorateValueBlock("text", "String", (block) => () => resultFieldValue(block, "TEXT"))
decorateValueBlock("logic_boolean", "Boolean", (block) => () => {
  const valueName = resultFieldValue(block, "BOOL");
  if(valueName == "TRUE") { return true };
  if(valueName == "FALSE") { return false };
  throw new Error("Booleano inicializado con un valor invalido");
})

