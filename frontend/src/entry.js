/* global document window */
import React from 'react'
import ReactDOM from 'react-dom'
import 'bootstrap/dist/css/bootstrap.min.css'

import App from './App'
import './utils/libgif'

const reactContainer = document.getElementById('react-container')

const brain = (function brain() {
  const timekey1543724668729 = '1543724668729. at what point does a thought become worthwhile to write down? Its 10:25pm, Saturday, Im thinking about .... i dont know. why  am i even doing this. nobody is goinng to want to visit my sites. and of the people who do (for some reason) visit my sites, nobody is going to read this. whats the point of writing it? whats the point of making it at all?'

  const components = {}
  const resizeCallbacks = []

  return {
    timekey1543724668729,
    store: (name, ref) => { components[name] = ref },
    tell: components,
    ask: components,
    onResize: (func) => { resizeCallbacks.push(func) },

    // private members
    p_resizeCallbacks: resizeCallbacks,
  }
}())

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
