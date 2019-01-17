/* global fetch Headers Blob XMLHttpRequest */
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
      let dataNumber = '-'
      let rootFetch

      const onWelcomeDone = () => {
        modal.toggle()
        cb(cbErr)
      }

      if (modal.isOpen()) {
        const waitFunc = (time) => {
          return new Promise((res) => {
            setTimeout(() => {
              res()
            }, time)
          })
        }
        modal.toggle()
        await waitFunc(400)
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

        // if r.responseURL then that is a response from XML request
        // otherwise its a response from fetch request. XML used to upload to S3
        // fetch used to get presigned URL. see comment below for explanation
        const respURL = r.responseURL
        if (respURL) {
          // this is a response from S3
          if (r.status === 200) {
            brain.tell.Welcome.addMessage('Successfully Uploaded!')
            brain.tell.Welcome.addMessage('Your data number is: ')
            brain.tell.Welcome.addMessage(`${dataNumber}`)
            brain.tell.Welcome.addMessage('Note: sometimes it might take a few minutes for your data to appear. If you dont see your data after 5 minutes, please email equilateralllc@gmail.com with your data number.')
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
          [dataNumber] = path.split('.')

          brain.tell.Welcome.addMessage('Successfully got signature')
          brain.tell.Welcome.addMessage('Uploading data to storage server')
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })

          const xhr = new XMLHttpRequest()
          xhr.open('PUT', URL, true)

          xhr.onload = () => {
            if (xhr.readyState === 4 && xhr.status === 200) {
              resp1(xhr)
            } else {
              errCatcher(xhr)
            }
          }

          xhr.send(blob)

          // here, I switched to using xhr request because for some reason
          // occasionally a fetch put request (only on mobile?) will end up
          // sending 0 bytes.

          // fetch(URL, {
          //   method: 'PUT',
          //   body: blob,
          // }).then(resp1)
          //   .catch(errCatcher)
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
