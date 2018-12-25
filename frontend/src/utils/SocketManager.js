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

    isConnected: () => socket && socket.connected,

    connect: (cb, token) => {
      socket = io.connect(`${socketEndpoint}?ua=${token}`, {
        transports: ['websocket', 'xhr-polling'],
      })

      socket.on('connect', () => {
        cb(socket)
      })
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
