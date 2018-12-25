import io from 'socket.io-client'

import {
  socketEndpoint,
} from '../customConfig'

function SocketManager(datastore) {
  const brain = datastore
  let socket = null

  const retObj = {
    on: (type, cb) => {
      socket.on(type, cb)
    },
    off: (type) => {
      socket.off(type)
    },

    connect: (cb) => {
      const actualConnect = (token, callback) => {
        socket = io.connect(`${socketEndpoint}?ua=${token}`, {
          transports: ['websocket', 'xhr-polling'],
        })

        socket.on('connect', () => {
          callback(socket)
        })
      }
      const tokenManager = brain.ask.Tokens
      let token = tokenManager.getToken()
      if (token && !tokenManager.isTokenExpired()) {
        // token exists, and is not expired. proceed to connect
        actualConnect(token, cb)
      } else {
        // otherwise fetch token, and then connect
        tokenManager.fetchToken((newToken) => {
          token = newToken
          tokenManager.storeToken(token)
          actualConnect(token, cb)
        })
      }
    },

    disconnect: () => {
      socket.disconnect()
    },

    emit: (type, msg) => {
      socket.emit(type, msg)
    },
  }

  brain.store('Sockets', retObj)
  return retObj
}

export default SocketManager
