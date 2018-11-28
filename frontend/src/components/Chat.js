/* global window */
import React, { Component } from 'react'
import PropTypes from 'prop-types'

export default class Chat extends Component {
  constructor(props) {
    super(props)
    this.brain = props.brain

    const iw = window.innerWidth
    const ih = window.innerHeight

    this.state = {
      orientation: iw > ih ? 'landscape' : 'portrait',
      leftPx: 0,
    }

    this.brain.store('Chat', this)
  }

  componentDidMount() {
    try {
      const size = this.brain.ask.Canvas.leaflet.offsetHeight
      this.setState({ leftPx: size })
    } catch (e) {
      // do nothing
    }
  }

  render() {
    const { orientation, leftPx } = this.state

    if (orientation === 'landscape') {
      return (
        <div className="chat-l" style={{ left: leftPx }}>
          dsaas
        </div>
      )
    }

    // else, render for mobile
    return (
      <div className="chat-p">
        fdsa
      </div>
    )
  }
}

Chat.propTypes = {
  brain: PropTypes.instanceOf(Object).isRequired,
}
