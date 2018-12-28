/* global fetch */
import {
  loginEndpoint,
} from '../customConfig'

const has = Object.prototype.hasOwnProperty

function UploadManager(datastore) {
  const brain = datastore

  const tempData = {}

  const retObj = {
    storeData: (key, data) => {
      if (!has.call(tempData, key)) {
        tempData[key] = data
        return true
      }
      // dont want to override some other data
      return false
    },
    clearData: (key) => {
      if (key && has.call(tempData, key)) {
        tempData[key] = null
        return true
      }
      if (!key) {
        // if no key provided, clear all data
        Object.keys(tempData).forEach((okey) => {
          tempData[okey] = null
        })
        return true
      }
      // notify user that data was not cleared
      return false
    },
  }

  brain.store('Uploads', retObj)
  return retObj
}

export default UploadManager
