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
    uploadData: async (key, cb) => {
      if (!has.call(tempData, key)) return cb(`Cannot find data for: ${key}`)

      const token = brain.ask.Tokens.getToken()
      const modal = brain.ask.MyModal

      modal.toggle({
        modal: () => (
          <Welcome brain={brain} initialMessage="Requesting data signature" />
        ),
        notCloseable: true,
        modalTitle: 'Uploading Your Data',
      })

      const data = tempData[key]

      const resp1 = (r) => {
        brain.tell.Welcome.addMessage('Got response')
        try {
          return r.json()
        } catch (e) {
          // this means its a response from S3, not lambda
          if (r.status === 200) {
            brain.tell.Welcome.addMessage('Successfully Uploaded!')
            // return cb(null)
          }
          brain.tell.Welcome.addMessage('Oops! Error uploading data to server', true)
          // return cb(r)
        }
      }

      const errCatcher = (e) => {
        console.log(e)
        brain.tell.Welcome.addMessage(`Unkown error: ${e}`, true)
        cb(e)
      }

      const resp2 = (obj) => {
        const { URL, error } = obj
        console.log(obj)
        if (error && error === 'Invalid token') {
          brain.tell.Welcome.addMessage('Token is expired? Trying to generate new one')
        } else if (error) {
          brain.tell.Welcome.addMessage(`Oops! Error getting a signature: ${error}`)
          // return cb(error)
        } else {
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
          fetch(URL, {
            method: 'PUT',
            body: blob,
          }).then(resp1)
            .catch(errCatcher)
        }
      }

      fetch(urlEndpoint, {
        method: 'GET',
        headers: new Headers({ Authorization: token }),
      })
        .then(resp1)
        .then(resp2)
        .catch(errCatcher)
    },
  }

  brain.store('Uploads', retObj)
  return retObj
}

export default UploadManager
