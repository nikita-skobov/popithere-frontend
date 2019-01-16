import io from 'socket.io-client'

import {
  socketEndpoint,
} from '../customConfig'

function SocketManager(datastore) {
  const brain = datastore
  let socket = null
  let successfulConnections = 0

  const retObj = {
    on: (type, cb) => {
      if (retObj.isConnected()) {
        socket.on(type, cb)
      }
    },
    once: (type, cb) => {
      if (retObj.isConnected()) {
        socket.once(type, cb)
      }
    },
    off: (type) => {
      if (retObj.isConnected()) {
        socket.off(type)
      }
    },

    isConnected: () => socket && socket.connected,

    getConnectionCount: () => successfulConnections,

    connect: (token, cb, callbacks) => {
      socket = io.connect(`${socketEndpoint}?ua=${token}`, {
        transports: ['websocket', 'xhr-polling'],
      })

      socket.on('connect', () => {
        if (callbacks) {
          // eslint-disable-next-line
          socket._callbacks = callbacks
        }
        successfulConnections += 1
        cb(socket)
      })
    },

    disconnect: () => {
      if (retObj.isConnected()) {
        socket.disconnect()
      }
    },

    emit: (type, msg) => {
      if (retObj.isConnected()) {
        socket.emit(type, msg)
      }
    },
  }

  brain.store('Sockets', retObj)
  return retObj
}

export default SocketManager
