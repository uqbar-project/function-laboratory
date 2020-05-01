const isBlockInput = input => input.type === 1

const isEmptyInput = input => !input.connection.targetConnection

const isEmptyBlockInput = input => isBlockInput(input) && isEmptyInput(input)

const isFullyBlockInput = input => isBlockInput(input) && !isEmptyInput(input)

const zipWith = (f) => (aList, anotherList) => aList.map((x, i) => f(x, anotherList[i]))

const zip = zipWith((x, y) => [x, y])

const mapValues = (f) => (object) =>
  Object.fromEntries(Object.entries(object).map(([key, value], i) => [key, f(value, i)]))

const intersect = (aList, anotherList) =>
  aList.filter(value => -1 !== anotherList.indexOf(value))
