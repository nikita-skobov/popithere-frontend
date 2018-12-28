/* global document window */
import '@babel/polyfill'
import React from 'react'
import ReactDOM from 'react-dom'
import 'bootstrap/dist/css/bootstrap.min.css'

import App from './App'
import './utils/libgif'
import SocketManager from './utils/SocketManager'
import TokenManager from './utils/TokenManager'
import UploadManager from './utils/UploadManager'

const reactContainer = document.getElementById('react-container')

const brain = (function brain() {
  const components = {}
  const resizeCallbacks = []

  return {
    store: (name, ref) => { components[name] = ref },
    tell: components,
    ask: components,
    onResize: (func) => { resizeCallbacks.push(func) },

    // private members
    p_resizeCallbacks: resizeCallbacks,
  }
}())

const socketManager = SocketManager(brain)
const tokenManager = TokenManager(brain)
const uploadManager = UploadManager(brain)

window.addEventListener('resize', (e) => {
  try {
    const ih = window.innerHeight
    const iw = window.innerWidth
    const size = brain.ask.Canvas.leaflet.offsetWidth
    if (brain.ask.App.shouldResize(iw, ih)) {
      brain.tell.Chat.changeOrientation(size)
    }

    brain.tell.Chat.adjust(size)
    brain.tell.Buttons.adjust(size)
  } catch (err) {
    // do nothing, try again
    // on next resize event
  }

  brain.p_resizeCallbacks.forEach((func) => {
    try {
      func(e)
    } catch (err) {
      // do nothing, try again
      // on next resize event
    }
  })
})

ReactDOM.render(<App brain={brain} />, reactContainer)
