/* global fetch */
import {
  dataFetchBase,
  listDataEndpoint,
  keyDataEndpoint,
} from '../customConfig'

function range(size, startAt = 0) {
  return [...Array(size).keys()].map(i => i + startAt)
}

const has = Object.prototype.hasOwnProperty

function DataManager(datastore) {
  const brain = datastore
  let lastFetchListTime = 0
  const listFetchDelay = 1 * 30 // 30 seconds

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
          if (!fetchingMap[dataNumber]) {
            fetchingMap[dataNumber] = []
          }
          fetchingMap[dataNumber].push(cb)
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
        console.log(`starting fetch ${s3key} for dn: ${dataNumber}`)
        fetch(url)
          .then(resp => resp.json())
          .then((obj2) => {
            console.log(`got ${s3key}, dn: ${dataNumber}`)
            dataObj[dataNumber] = obj2

            if (fetchingMap[dataNumber]) {
              // this is a hooked callback array from
              // getDataLater. if fetchingMap
              // of dataNumber is false, that means
              // no one hooked in
              fetchingMap[dataNumber].forEach((cb2) => {
                cb2(null, obj2)
              })
            }

            delete fetchingMap[dataNumber]
          })
          .catch((err) => {
            if (fetchingMap[dataNumber]) {
              fetchingMap[dataNumber].forEach((cb2) => {
                cb2(err, null)
              })
              delete fetchingMap[dataNumber]
            }
          })
      } catch (e) {
        if (fetchingMap[dataNumber]) {
          fetchingMap[dataNumber].forEach((cb2) => {
            cb2(e, null)
          })
          delete fetchingMap[dataNumber]
        }
        console.error(e)
      }
    },
    fetchRange: (rang) => {
      const [start, stop] = rang
      const iterator = range(stop - start, start)
      iterator.forEach((index) => {
        retObj.fetchData(index, null)
      })
    },
    fetchKey: (key) => {
      return new Promise((res, rej) => {
        if (!has.call(fetchingMap, key)) {
          fetchingMap[key] = false
        }
        const url = `${keyDataEndpoint}/${key}`
        fetch(url)
          .then(resp => resp.json())
          .then((obj) => {
            if (has.call(obj, 'error')) {
              return rej(obj.error)
            }
            return res(obj.key)
          })
          .catch(err => rej(err))
      })
    },
    fetchList: (cb) => {
      let callback = cb
      if (!callback) {
        callback = () => {}
      }

      const rightNow = Math.floor(Date.now() / 1000)
      if (rightNow < lastFetchListTime + listFetchDelay) {
        console.log('preventing early list fetch')
        callback('too early', null)
        return null
      }


      fetch(listDataEndpoint)
        .then(resp => resp.json())
        .then((list) => {
          dataList = list
          lastFetchListTime = Math.floor(Date.now() / 1000)
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
    getDataLater: async (dataNumber, cb) => {
      let callback = cb
      if (!callback) {
        callback = () => {}
      }

      if (has.call(dataObj, dataNumber)) {
        // if we already have it, just return it
        callback(null, dataObj[dataNumber])
        return null
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

      let s3key = s3keys[dataNumber]
      if (!s3key) {
        try {
          fetchingMap[dataNumber] = [callback]
          s3key = await retObj.fetchKey(dataNumber)
        } catch (e) {
          console.error(`FAILED to fetch s3id from key: ${dataNumber}`)
          if (fetchingMap[dataNumber]) {
            fetchingMap[dataNumber].forEach((cb2) => {
              cb2(e, null)
            })
            delete fetchingMap[dataNumber]
          }
          return null
        }
      }

      retObj.fetchData(null, { key: s3key, dn: dataNumber, cb: callback })
    },
    getDataNumbers: () => [...dataNumberList],
  }

  brain.store('DataMan', retObj)
  return retObj
}

export default DataManager
