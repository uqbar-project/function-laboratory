// Blockly
const isBlockInput = input => input.type === 1

const isEmptyInput = input => !input.connection.targetConnection

const isEmptyBlockInput = input => isBlockInput(input) && isEmptyInput(input)

const isFullyBlockInput = input => isBlockInput(input) && !isEmptyInput(input)

const getInputField = input => input.fieldRow[0].getValue()

const blockInputs = block => block.inputList.filter(isBlockInput)
// Blockly

// Iterables
const last = list => list.reverse()[0]

const zipWith = (f) => (aList, anotherList) => aList.map((x, i) => f(x, anotherList[i]))

const zip = zipWith((x, y) => [x, y])

const zipObjects = (obj1, obj2) =>
  Object.fromEntries(Object.entries(obj1).filter(([key, _]) => obj2[key]).map(([key, value]) => [key, [value, obj2[key]]]))

const mapValues = (f) => (object) =>
  Object.fromEntries(Object.entries(object).map(([key, value], i) => [key, f(value, i)]))

const intersect = (aList, anotherList) =>
  aList.filter(value => -1 !== anotherList.indexOf(value))
// Iterables

// Others
const add = (n1, n2) => n1 + n2
// Others
