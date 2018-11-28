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
      width: 100,
    }

    this.brain.store('Chat', this)

    this.adjust = this.adjust.bind(this)
    this.changeOrientation = this.changeOrientation.bind(this)
  }

  componentDidMount() {
    try {
      const size = this.brain.ask.Canvas.leaflet.offsetHeight
      const iw = window.innerWidth
      const width = iw - size // get remaining width to the right of canvas
      this.setState({ leftPx: size, width })
    } catch (e) {
      // do nothing
    }
  }

  changeOrientation() {
    const { orientation } = this.state
    if (orientation === 'landscape') {
      this.setState({ orientation: 'portrait' })
    } else if (orientation === 'portrait') {
      this.setState({ orientation: 'landscape' })
    }
  }

  adjust(size) {
    const leftPx = size
    const width = window.innerWidth - size
    if (this.state.leftPx !== leftPx) {
      // only set state if it is different from the last state
      this.setState({ leftPx })
    }
    if (this.state.width !== width) {
      this.setState({ width })
    }
  }

  render() {
    const { orientation, leftPx, width } = this.state

    if (orientation === 'landscape') {
      return (
        <div className="chat-l" style={{ left: leftPx, width }}>
          dsaas
        </div>
      )
    }

    // else, render for mobile
    return (
      <div className="chat-p" style={{ top: leftPx }}>
        fdsa
      </div>
    )
  }
}

Chat.propTypes = {
  brain: PropTypes.instanceOf(Object).isRequired,
}
