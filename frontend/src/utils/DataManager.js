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

  // a map of data numbers to s3 keys. useful for getDataLater
  const s3keys = {}

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
    fetchData: (index, obj) => {
      let s3key
      let dataNumber
      let cb = false
      if (typeof index === 'number') {
        if (index > dataList.length) throw new Error('Fetch index out of range')
        s3key = dataList[index].si
        dataNumber = dataList[index].dn
      }
      if (obj) {
        // case of 2nd parameter is an object.
        // it is implied that if key is provided, so is dn
        s3key = obj.key
        dataNumber = obj.dn
        // eslint-disable-next-line
        cb = obj.cb
      }
      try {
        if (cb) {
          // if user provided callback, set fetch map
          // to an array of callbacks
          fetchingMap[dataNumber] = [cb]
        } else {
          // otherwise set it to false. this way
          // if there are future hooks, theyll see that it is false,
          // and they can change it to an array of callbacks
          fetchingMap[dataNumber] = false
        }
        // this gets the s3 object key
        // which is appended to the api base
        // and then fetched
        const url = `${dataFetchBase}${s3key}`
        console.log(url)
        fetch(url)
          .then(resp => resp.json())
          .then((obj2) => {
            console.log(`got ${s3key}, dn: ${dataNumber}`)
            dataObj[dataNumber] = obj

            if (fetchingMap[dataNumber]) {
              // this is a hooked callback array from
              // getDataLater. if fetchingMap
              // of dataNumber is false, that means
              // no one hooked in
              fetchingMap[dataNumber].forEach(cb2 => cb2(obj2))
            }

            delete fetchingMap[dataNumber]
          })
          .catch((err) => {
            if (cb) {
              cb(err)
            }
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
      iterator.forEach((index) => {
        retObj.fetchData(index, null)
      })
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
            s3keys[obj.dn] = obj.si
          })
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

      if (has.call(fetchingMap, dataNumber)) {
        if (!fetchingMap[dataNumber]) {
          // if it is set to false, then turn it into an array
          fetchingMap[dataNumber] = []
        }
        fetchingMap[dataNumber].push(callback)
        // dont fetch because we are already fetching it.
        console.log('NOT FETCHING BECAUSE ALREADY FETCH IN PROGRESS')
        return null
      }

      // FOR NOW we are going to assume that if a dataNumber is to be
      // fetched, that the client already has that dataNumber in the dataNumberList
      // however, in the future, we should implement checking to see if it is there.
      // if it is NOT there, we need to first find the s3 key for that data number, and
      // then fetch it!

      const s3key = s3keys[dataNumber]

      retObj.fetchData(null, { key: s3key, dn: dataNumber, cb: callback })
    },
    getDataNumbers: () => [...dataNumberList],
  }

  brain.store('DataMan', retObj)
  return retObj
}

export default DataManager
