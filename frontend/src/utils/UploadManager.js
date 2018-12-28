/* global fetch Headers Blob */
import React from 'react'

import {
  loginEndpoint,
  urlEndpoint,
} from '../customConfig'

import Welcome from '../components/Welcome'

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
    uploadData: (key, cb) => {
      if (!has.call(tempData, key)) return cb(`Cannot find data for: ${key}`)

      const token = brain.ask.Tokens.getToken()
      const modal = brain.ask.MyModal

      modal.toggle({
        modal: () => (
          <Welcome brain={brain} initialMessage="custom" />
        ),
        notCloseable: true,
        modalTitle: 'Uploading Your Data',
      })

      const data = tempData[key]
      fetch(urlEndpoint, {
        method: 'GET',
        headers: new Headers({ Authorization: token }),
      }).then(resp => resp.json())
        .then((obj) => {
          const { URL, error } = obj
          if (error) return cb(error)
          console.log(obj)
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
          fetch(URL, {
            method: 'PUT',
            body: blob,
          }).then((resp) => {
            console.log(resp)
            if (resp.status === 200) {
              return cb(null)
            }
            return cb(resp)
          })
            .catch(err => cb(err))
          return null
        })
        .catch(err => cb(err))
    },
  }

  brain.store('Uploads', retObj)
  return retObj
}

export default UploadManager
