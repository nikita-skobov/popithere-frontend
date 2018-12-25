/* global localStorage fetch */
import {
  loginEndpoint,
} from '../customConfig'

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
          .then(obj => cb(obj))
          .catch(err => cb(err))
      } else {
        // first time fetching, so we dont add token to header
        fetch(loginEndpoint)
          .then(resp => resp.json())
          .then(obj => cb(obj))
          .catch(err => cb(err))
      }
    },
  }

  brain.store('Tokens', retObj)
  return retObj
}

export default TokenManager
