// Not Truth Values
const emptyStr = ''
const undifiendVal = undefined
const nullVal = null
const zeroVal = 0
const notaNumberVal = NaN
const falseNumberVal = false
// Truth Values
const nonEmptyStr = 'test'
const trueNumberVal = true
const numberVal = 1

console.log(!!emptyStr) //false
console.log(!!undifiendVal) //false
console.log(!!nullVal) //false
console.log(!!zeroVal) //false
console.log(!!notaNumberVal) //false
console.log(!!falseNumberVal) //false


console.log(!!nonEmptyStr) // true
console.log(!!trueNumberVal) // true
console.log(!!numberVal) // true