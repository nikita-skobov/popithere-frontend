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
  let dataList = []
  let lastFetchListTime = null

  const dataObj = {}

  const fetchingMap = {}

  const retObj = {
    fetchData: (index) => {
      try {
        if (index > dataList.length) throw new Error('Fetch index out of range!')

        const s3key = dataList[index].si
        const dataNumber = dataList[index].dn
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
  }

  brain.store('DataMan', retObj)
  return retObj
}

export default DataManager
