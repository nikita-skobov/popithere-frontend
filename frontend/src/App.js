/* global window */
import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { Container, Row, Col } from 'reactstrap'

export default class App extends Component {
  constructor(props) {
    super(props)
    this.brain = props.brain

    const iw = window.innerWidth
    const ih = window.innerHeight

    this.state = {
      orientation: iw > ih ? 'landscape' : 'portrait',
    }

    this.brain.store('App', this)
  
    this.shouldResize = this.shouldResize.bind(this)
  }

  shouldResize(iw, ih) {
    // inner width, inner height
    let should = false
    let { orientation } = this.state
    if (orientation === 'landscape' && iw < ih) {
      should = true
      orientation = 'portrait'
    } else if (orientation === 'portrait' && ih < iw) {
      should = true
      orientation = 'landscape'
    }
    this.setState({ orientation })
    return should
  }

  render() {
    return (
      <div className="pos">
        <div className="square">
          <canvas className="canvas" />
        </div>
      </div>
    )
  }
}

App.propTypes = {
  brain: PropTypes.instanceOf(Object).isRequired,
}
