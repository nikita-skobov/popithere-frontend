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
      const ua = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJjaHQiOjEwMCwicGl0IjoxMCwiaWQiOiJkc2FkYXNkc2EiLCJtY2JiIjozMDAsImV4cCI6MTU0NTY4Mzk5OCwiaWF0IjoxNTQ1NjgzODE4fQ.hOjdkFG3-Oays1u2kSLYvN8UXM4ED5N6N62YwL9ExRufAR-Tu2b-Tjt8aBmKg8lk9RkR5fL_3-whg8GAfRy4Jg'
      socket = io.connect(`${socketEndpoint}?ua=${ua}`, {
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
