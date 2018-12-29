/* global fetch */
import React from 'react'

import {
  dataFetchBase,
  listDataEndpoint,
} from '../customConfig'

function range(size, startAt = 0) {
  return [...Array(size).keys()].map(i => i + startAt)
}

const has = Object.prototype.hasOwnProperty

function DataManager(datastore) {
  const brain = datastore
  let lastFetchListTime = null

  // a list of data that is fetched on page load
  // this is a list of objects with 2 keys:
  // a data number, and an s3 id telling the client
  // where to download that data nummber from
  let dataList = []

  // this is an in memory map of data that the client currently
  // has. data can (AND SHOULD!) be released when it is no longer needed
  // the keys in this object are the  dataNumbers, and the value is whatever
  // data is fetched (should be a json object or array)
  const dataObj = {}

  // a temporary map of dataNumbers that are currently being fetched
  // This is used to prevent multiple fetches of the same item.
  const fetchingMap = {}

  // a list of all dataNumbers that were fetched from the dataList
  // these are not necessarily data numbers that correspond to a data object
  // in memory, but rather a list of data numbers that the client KNOWS ABOUT.
  // if they arent in memory, they can easily be fetched later.
  let dataNumberList = []

  const retObj = {
    fetchData: (index) => {
      try {
        if (index > dataList.length) throw new Error('Fetch index out of range!')

        const s3key = dataList[index].si
        const dataNumber = dataList[index].dn
        fetchingMap[dataNumber] = true
        // this gets the s3 object key
        // which is appended to the api base
        // and then fetched
        const url = `${dataFetchBase}${s3key}`
        console.log(url)
        fetch(url)
          .then(resp => resp.json())
          .then((obj) => {
            console.log(`got ${s3key}, dn: ${dataNumber}`)
            dataObj[dataNumber] = obj
            delete fetchingMap[dataNumber]
          })
      } catch (e) {
        console.error(e)
      }
    },
    dataHasBeenFetched: (key, data) => {

    },
    fetchRange: (rang) => {
      const [start, stop] = rang
      const iterator = range(stop - start, start)

      console.log(iterator)
      iterator.forEach(retObj.fetchData)
    },
    fetchList: (cb) => {
      let callback = cb
      if (!callback) {
        callback = () => {}
      }

      fetch(listDataEndpoint)
        .then(resp => resp.json())
        .then((list) => {
          dataList = list
          lastFetchListTime = Date.now()
          dataNumberList = []
          dataList.forEach((obj) => {
            dataNumberList.push(obj.dn)
          })
          console.log(dataNumberList)
          console.log(dataList)
          callback(null, list.length)
        })
        .catch(err => callback(err))
    },
    getDataNow: dataNumber => dataObj[dataNumber],
    getDataLater: (dataNumber, cb) => {
      let callback = cb
      if (!callback) {
        callback = () => {}
      }
    },
    getDataNumbers: () => [...dataNumberList],
  }

  brain.store('DataMan', retObj)
  return retObj
}

export default DataManager
