const AWS = require('aws-sdk')

const dynamodb = new AWS.DynamoDB({
  region: process.env.REGION,
})
const has = Object.prototype.hasOwnProperty

function makeParams(source) {
  const p = process.env
  const params = { Item: {} }
  params.TableName = p.TABLE_NAME
  params.Item[p.TABLE_KEY] = {
    S: source.headers.ip,
  }
  return params
}

function putDatabase(params) {
  console.log(params)
  return new Promise((res, rej) => {
    dynamodb.putItem(params, (err, data) => {
      if (err) rej(err)
      res(data)
    })
  })
}

function putDatabaseTest(params) {
  console.log('put database test!!!')
  return new Promise((res, rej) => {
    if (has.call(params, 'Item') && has.call(params, 'TableName')) {
      if (typeof params.TableName === 'string') {
        res()
      } else {
        rej(new Error(`TableName not a string: ${params.TableName}`))
      }
    } else {
      rej(new Error('Must provide both Item, and TableName'))
    }
  })
}

module.exports.makeParams = makeParams
if (process.env.NODE_ENV === 'test') {
  module.exports.putDatabase = putDatabaseTest
} else {
  module.exports.putDatabase = putDatabase
}
