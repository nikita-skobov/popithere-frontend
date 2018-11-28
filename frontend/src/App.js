/* global window */
import React, { Component } from 'react'
import PropTypes from 'prop-types'

import Canvas from './components/Canvas'
import Buttons from './components/Buttons'
import Chat from './components/Chat'
import MyModal from './components/MyModal'

export default class App extends Component {
  constructor(props) {
    super(props)
    this.brain = props.brain

    const iw = window.innerWidth
    const ih = window.innerHeight

    this.orientation = iw > ih ? 'landscape' : 'portrait'

    this.brain.store('App', this)

    this.shouldResize = this.shouldResize.bind(this)
  }

  shouldResize(iw, ih) {
    // inner width, inner height
    let should = false
    let { orientation } = this
    if (orientation === 'landscape' && iw < ih) {
      should = true
      orientation = 'portrait'
    } else if (orientation === 'portrait' && ih < iw) {
      should = true
      orientation = 'landscape'
    }

    this.orientation = orientation
    return should
  }

  render() {
    return [
      <Canvas brain={this.brain} />,
      <Buttons buttonsWidth={80} brain={this.brain} />,
      <Chat brain={this.brain} />,
      <MyModal brain={this.brain} />,
    ]
  }
}

App.propTypes = {
  brain: PropTypes.instanceOf(Object).isRequired,
}
