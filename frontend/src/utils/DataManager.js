/* global fetch */
import React from 'react'

import {
  listDataEndpoint,
} from '../customConfig'

const has = Object.prototype.hasOwnProperty

function DataManager(datastore) {
  const brain = datastore
  let dataList = []
  let lastFetchListTime = null

  const dataObj = {}

  const fetchingMap = {}

  const retObj = {
    fetchData: (key) => {
      
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
          callback()
        })
        .catch(err => callback(err))
    },
    getData: (key) => {
      if (!has.call(dataObj, key)) {
        return null
      }
      return dataObj[key]
    },
    // storeData: (key, data) => {
    //   if (!has.call(dataObj, key)) {
    //     dataObj[key] = data
    //     return true
    //   }
    //   // dont want to override some other data
    //   return false
    // },
    // clearData: (key) => {
    //   if (key && has.call(tempData, key)) {
    //     tempData[key] = null
    //     delete tempData[key]
    //     return true
    //   }
    //   if (!key) {
    //     // if no key provided, clear all data
    //     Object.keys(tempData).forEach((okey) => {
    //       tempData[okey] = null
    //       delete tempData[okey]
    //     })
    //     return true
    //   }
    //   // notify user that data was not cleared
    //   return false
    // },
  }

  brain.store('DataMan', retObj)
  return retObj
}

export default DataManager
