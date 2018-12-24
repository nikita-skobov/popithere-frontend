// too lazy to think of an algorithm
const myMap = {}

// 33 through 126
const firstIterator = [...Array(94).keys()]
let currentValue = 0

firstIterator.forEach((key) => {
  const val = key + 33
  myMap[String.fromCharCode(val)] = currentValue
  currentValue += 1
})

// theres a gap, so this one gets entered manually
myMap['€'] = currentValue
currentValue += 1

// 130 through 140
// these cannot be read by the browser
// const secondIterator = [...Array(11).keys()]
// secondIterator.forEach((key) => {
//   const val = key + 130
//   myMap[String.fromCharCode(val)] = currentValue
//   currentValue += 1
// })

// another gap
myMap['Ž'] = currentValue

// 145 through 156
// these can also not be ready by the browser
// const thirdIterator = [...Array(12).keys()]
// thirdIterator.forEach((key) => {
//   const val = key + 145
//   myMap[String.fromCharCode(val)] = currentValue
//   currentValue += 1
// })

// another gap
myMap['ž'] = currentValue
currentValue += 1
myMap['Ÿ'] = currentValue
currentValue += 1

// 161 through 172
const fourthIterator = [...Array(12).keys()]
fourthIterator.forEach((key) => {
  const val = key + 161
  myMap[String.fromCharCode(val)] = currentValue
  currentValue += 1
})

// 174 through 255
const fifthIterator = [...Array(82).keys()]
fifthIterator.forEach((key) => {
  const val = key + 174
  myMap[String.fromCharCode(val)] = currentValue
  currentValue += 1
})

const myMapReverse = {}

Object.keys(myMap).forEach((key) => {
  myMapReverse[myMap[key]] = key
})


export function positionToString(position) {
  // position can be between 0 and 190
  return myMapReverse[position]
}

export function stringToPosition(string) {
  // string can be any of the character codes generated into myMap
  return myMap[string]
}
