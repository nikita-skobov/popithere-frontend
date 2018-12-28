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

      const onWelcomeDone = () => {
        console.log('WELCOME DOOONNNNNE')
      }

      modal.toggle({
        modal: () => (
          <Welcome brain={brain} callback={onWelcomeDone} btnText="Ok" initialMessage="Requesting data signature" />
        ),
        notCloseable: true,
        modalTitle: 'Uploading Your Data',
      })

      const data = tempData[key]

      const resp1 = (r) => {
        brain.tell.Welcome.addMessage('Got response')
        if (r.statusText === 'OK') {
          // this is a response from S3
          if (r.status === 200) {
            brain.tell.Welcome.addMessage('Successfully Uploaded!')
            brain.tell.Welcome.welcomeDone()
          } else {
            brain.tell.Welcome.addMessage('Oops! Error uploading data to server', true)
            brain.tell.Welcome.welcomeDone()
          }
        } else {
          // this is a response from lambda
          return r.json()
        }
      }

      const errCatcher = (e) => {
        console.log(e)
        brain.tell.Welcome.addMessage(`Unkown error: ${e}`, true)
        brain.tell.Welcome.welcomeDone()
      }

      const resp2 = (obj) => {
        const { URL, error } = obj
        console.log(obj)
        if (error && error === 'Invalid token') {
          brain.tell.Welcome.addMessage('Token is expired? Trying to generate new one')
        } else if (error) {
          brain.tell.Welcome.addMessage(`Oops! Error getting a signature: ${error}`)
          brain.tell.Welcome.welcomeDone()
        } else {
          brain.tell.Welcome.addMessage('Successfully got signature')
          brain.tell.Welcome.addMessage('Uploading data to storage server')
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
