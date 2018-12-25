/* global localStorage fetch */
import {
  loginEndpoint,
} from '../customConfig'

const has = Object.prototype.hasOwnProperty

function TokenManager(datastore) {
  const brain = datastore
  let token = ''

  const retObj = {
    getToken: () => token,
    storeToken: (tk) => {
      localStorage.setItem('token', tk)
      token = tk
    },
    isTokenExpired: () => {
      return false
    },
    fetchToken: (cb) => {
      const oldToken = retObj.getToken()
      if (oldToken) {
        // old token already exists, so well add it as a header
        fetch(loginEndpoint, {
          headers: {
            'X-Custom-Token': oldToken,
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
              cb(obj, null, null)
            }
          })
          .catch(err => cb(err))
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
              cb(obj, null, null)
            }
          })
          .catch(err => cb(err))
      }
    },
  }

  brain.store('Tokens', retObj)
  return retObj
}

export default TokenManager
