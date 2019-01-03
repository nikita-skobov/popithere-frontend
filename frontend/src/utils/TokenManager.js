/* global localStorage fetch */
import * as jwtDecode from 'jwt-decode'

import {
  loginEndpoint,
} from '../customConfig'


const has = Object.prototype.hasOwnProperty

function TokenManager(datastore) {
  const brain = datastore
  let token = localStorage.getItem('token')
  let claims = {}

  const retObj = {
    fillClaims: () => {
      try {
        if (token === 'notoken') {
          const rn = Math.floor(Date.now() / 1000)
          claims = {
            cht: 0,
            exp: rn + 3600, // 1 hour from now
            iat: rn,
            id: 'notoken',
            mcbb: 300,
            myo: 0,
            pit: 0,
          }
        } else {
          const decoded = jwtDecode(token)
          delete decoded.swv
          claims = decoded
        }
      } catch (e) {
        // just console log it i guess?
        console.error(e)
      }
    },
    getToken: () => token,
    storeToken: (tk) => {
      localStorage.setItem('token', tk)
      token = tk
      retObj.fillClaims()
    },
    removeToken: () => {
      localStorage.removeItem('token')
    },
    isTokenExpired: () => {
      if (token === 'notoken') return true

      const { exp } = claims
      const bufferTime = 30 // give a 30 second buffer to expiration
      const rightNow = Math.floor(new Date().getTime() / 1000) + (bufferTime)
      const isExpired = (rightNow > exp)
      console.log(`expired? ${isExpired}`)
      return isExpired
    },
    fetchToken: (cb) => {
      const oldToken = retObj.getToken()
      if (oldToken) {
        // old token already exists, so well add it as a header
        fetch(loginEndpoint, {
          headers: {
            Authorization: oldToken,
          },
        })
          .then(resp => resp.json())
          .then((obj) => {
            if (has.call(obj, 'token') && !has.call(obj, 'msg')) {
              // got token without any warning
              cb(null, obj.token, null)
            } else if (has.call(obj, 'msg')) {
              // got new token, but it has a warning msg
              cb(null, obj.token, obj.msg)
            } else if (has.call(obj, 'error')) {
              // did not get token. some kind of possible server error
              cb(obj.error, null, null)
            } else {
              // unknown error
              cb(null, null, null, obj)
            }
          })
          .catch(err => cb(null, null, null, err))
      } else {
        // first time fetching, so we dont add token to header
        fetch(loginEndpoint)
          .then(resp => resp.json())
          .then((obj) => {
            if (has.call(obj, 'token') && !has.call(obj, 'msg')) {
              // got token without any warning
              cb(null, obj.token, null)
            } else if (has.call(obj, 'msg')) {
              // got new token, but it has a warning msg
              cb(null, obj.token, obj.msg)
            } else if (has.call(obj, 'error')) {
              // did not get token. some kind of possible server error
              cb(obj.error, null, null)
            } else {
              // unknown error
              cb(null, null, null, obj)
            }
          })
          .catch(err => cb(null, null, null, err))
      }
    },
  }

  retObj.fillClaims()

  brain.store('Tokens', retObj)
  return retObj
}

export default TokenManager
