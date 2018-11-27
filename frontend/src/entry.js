/* global document window */
import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import 'bootstrap/dist/css/bootstrap.min.css'

const reactContainer = document.getElementById('react-container')

const brain = (function brain() {
  const components = {}

  return {
    store: (name, ref) => { components[name] = ref },
    tell: components,
    ask: components,
  }
}())

window.addEventListener('resize', (e) => {
  try {
    const ih = window.innerHeight
    const iw = window.innerWidth
    const size = brain.ask.Canvas.leaflet.offsetWidth
    if (brain.ask.App.shouldResize(iw, ih)) {
      console.log(brain.tell.Canvas.leaflet)
      brain.tell.Buttons.adjust(size, true)
    } else {
      brain.tell.Buttons.adjust(size, false)
    }
    console.log()
  } catch (err) {
    // do nothing, try again
    // on next resize event
  }
})

ReactDOM.render(<App brain={brain} />, reactContainer)
