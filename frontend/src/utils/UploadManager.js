/* global fetch Headers Blob */
import React from 'react'

import {
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
        delete tempData[key]
        return true
      }
      if (!key) {
        // if no key provided, clear all data
        Object.keys(tempData).forEach((okey) => {
          tempData[okey] = null
          delete tempData[okey]
        })
        return true
      }
      // notify user that data was not cleared
      return false
    },
    uploadData: async (key, cb) => {
      if (!has.call(tempData, key)) return cb(`Cannot find data for: ${key}`)

      let token = brain.ask.Tokens.getToken()
      const modal = brain.ask.MyModal

      let cbErr = false
      let tokenReFetched = false
      let dataName = '-'
      let rootFetch

      const onWelcomeDone = () => {
        modal.toggle()
        cb(cbErr)
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
        brain.tell.Welcome.addMessage('Got response', true)
        if (r.statusText === 'OK') {
          // this is a response from S3
          if (r.status === 200) {
            brain.tell.Welcome.addMessage('Successfully Uploaded!')
            brain.tell.Welcome.addMessage(`Your data name should be: ${dataName}`)
            brain.tell.Welcome.addMessage(`
            Please Note: there is a chance that your data name might be altered slightly. In
            this case, it will have a . in front, and it will be followed by several random characters.
            `)
            brain.tell.Welcome.welcomeDone()
          } else {
            cbErr = 'Error uploading data to server'
            brain.tell.Welcome.addMessage(`Oops! ${cbErr}`)
            brain.tell.Welcome.welcomeDone()
          }
        } else {
          // this is a response from lambda
          return r.json()
        }
      }

      const errCatcher = (e) => {
        console.log(e)
        cbErr = e
        brain.tell.Welcome.addMessage(`Unkown error: ${e}`, true)
        brain.tell.Welcome.welcomeDone()
      }

      const resp2 = (obj) => {
        const { URL, error } = obj
        if (error && error === 'Token expired') {
          brain.tell.Welcome.addMessage('Token is expired? Trying to generate new one')

          if (tokenReFetched) {
            brain.tell.Welcome.addMessage('Already tried fetching token, and it failed. Try refreshing your page. If this error persists, please notify the site owner.')
            brain.tell.Welcome.welcomeDone()
            return null
          }

          brain.ask.Tokens.fetchToken((e1, tok, msg, e2) => {
            tokenReFetched = true
            let tryAgain = false
            if (tok) {
              tryAgain = true
              token = tok
              brain.tell.Tokens.storeToken(tok)
              brain.tell.Welcome.addMessage('Got new token. Trying again')
            }
            if (msg) {
              brain.tell.Welcome.addMessage(`Server issued a warning: ${msg}`)
            }
            if (e1) {
              brain.tell.Welcome.addMessage(`Error getting token: ${e1}`)
              brain.tell.Welcome.welcomeDone()
            }
            if (e2) {
              brain.tell.Welcome.addMessage(`Unknown error getting token: ${typeof e2 === 'object' ? e2.message : e2}`)
            }
            if (tryAgain) {
              rootFetch()
            }
          })
        } else if (error) {
          cbErr = error
          brain.tell.Welcome.addMessage(`Oops! Error getting a signature: ${error}`)
          brain.tell.Welcome.welcomeDone()
        } else {
          const splitUrl = URL.split('/')
          const path = splitUrl[3]; // wow I actually needed to use a semicolon here
          [dataName] = path.split('.')

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

      rootFetch = () => {
        fetch(urlEndpoint, {
          method: 'GET',
          headers: new Headers({ Authorization: token }),
        })
          .then(resp1)
          .then(resp2)
          .catch(errCatcher)
      }

      rootFetch()
    },
  }

  brain.store('Uploads', retObj)
  return retObj
}

export default UploadManager
