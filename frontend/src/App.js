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
    const { orientation } = this.state
    let should = false
    let newOr = orientation
    if (orientation === 'landscape' && iw <= ih) {
      newOr = 'portrait'
      should = true
    } else if (orientation === 'portrait' && ih <= iw) {
      newOr = 'landscape'
      should = true
    }
    if (newOr !== orientation) {
      this.setState({ orientation: newOr })
    }
    return should
  }

  render() {
    const { orientation } = this.state
    console.log('rendering app')
    if (orientation === 'landscape') {
      // render for desktop
      return (
        <div className="parent">
          <div className="square-holder" />
          <div className="sidebar" />
        </div>
      )
    }

    // else, render for mobile/tablet
    return (
      <div className="parent">
        <div className="square-holder-p" />
        <div className="sidebar-p" />
      </div>
    )
  }
}

App.propTypes = {
  brain: PropTypes.instanceOf(Object).isRequired,
}
