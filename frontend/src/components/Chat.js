/* global window */
import React, { Component } from 'react'
import PropTypes from 'prop-types'

import ChatInput from './ChatInput'
import ChatBox from './ChatBox'

export default class Chat extends Component {
  constructor(props) {
    super(props)
    this.brain = props.brain

    const iw = window.innerWidth
    const ih = window.innerHeight

    this.state = {
      orientation: iw > ih ? 'landscape' : 'portrait',
      leftPx: 0,
      topPx: 0,
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

  changeOrientation(size) {
    const { orientation } = this.state
    if (orientation === 'landscape') {
      this.setState({ orientation: 'portrait' })
      this.brain.tell.ChatBox.setState({ maxHeight: size * 0.9 })
    } else if (orientation === 'portrait') {
      this.setState({ orientation: 'landscape' })
      this.brain.tell.ChatBox.setState({ maxHeight: size * 0.9 })
    }
  }

  adjust(size) {
    const { orientation } = this.state
    const leftPx = size
    const topPx = this.brain.ask.Canvas.leaflet.offsetTop
    const width = window.innerWidth - size
    if (this.state.leftPx !== leftPx) {
      // only set state if it is different from the last state
      this.setState({ leftPx })
    }
    if (this.state.topPx !== topPx) {
      this.setState({ topPx })
    }
    if (this.state.width !== width && orientation === 'landscape') {
      // only set width if its different AND orientation is landscape
      // mobile has width = 100% by default
      this.setState({ width })
    }
  }

  render() {
    const { orientation, leftPx, width, topPx } = this.state

    if (orientation === 'landscape') {
      return (
        <div className="chat-l" style={{ left: leftPx, width, top: topPx }}>
          <ChatInput brain={this.brain} />
          <ChatBox brain={this.brain} />
        </div>
      )
    }

    // else, render for mobile
    return (
      <div className="chat-p" style={{ top: leftPx + topPx }}>
        <ChatInput brain={this.brain} />
        <ChatBox brain={this.brain} />
      </div>
    )
  }
}

Chat.propTypes = {
  brain: PropTypes.instanceOf(Object).isRequired,
}
