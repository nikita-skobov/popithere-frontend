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
    brain.ask.App.shouldResize(iw, ih)
  } catch (err) {
    // do nothing, try again
    // on next resize event
  }
})

ReactDOM.render(<App brain={brain} />, reactContainer)
