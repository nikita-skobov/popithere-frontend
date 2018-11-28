/* global window */
import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { Button } from 'reactstrap'

export default class Buttons extends Component {
  constructor(props) {
    super(props)
    this.buttonsWidth = props.buttonsWidth
    this.buttonsOffset = props.buttonsOffset
    this.brain = props.brain

    const iw = window.innerWidth
    const ih = window.innerHeight

    this.state = {
      leftPx: 0,
      orientation: iw > ih ? 'landscape' : 'portrait',
    }

    this.brain.store('Buttons', this)

    this.adjust = this.adjust.bind(this)
  }

  moveButtons(orientation, size) {
    if (orientation === 'landscape') {
      const leftPx = size + (this.buttonsWidth / 2) + this.buttonsOffset
      if (this.state.leftPx !== leftPx) {
        // only set state if it is different from the last state
        this.setState({ leftPx })
      }
    }
    // else if orientation portrait
    const leftPx = size + this.buttonsOffset
    if (this.state.leftPx !== leftPx) {
      // only set state if it is different from the last state
      this.setState({ leftPx })
    }
  }

  adjust(size, changePos) {
    let { orientation } = this.state
    if (changePos) {
      if (orientation === 'portrait') orientation = 'landscape'
      else if (orientation === 'landscape') orientation = 'portrait'
      this.setState({ orientation }, () => {
        this.moveButtons(orientation, size)
      })
    }
    this.moveButtons(orientation, size)
  }

  render() {
    const { buttonsWidth } = this
    const { leftPx, orientation } = this.state

    if (orientation === 'landscape') {
      return (
        <div className="my-buttons" style={{ left: leftPx, width: buttonsWidth }}>
          <Button block>Chat</Button>
          <Button block>More</Button>
          <Button block>3</Button>
        </div>
      )
    }

    // else, render for mobile
    return (
      <div className="my-buttons-portrait" style={{ top: leftPx, height: buttonsWidth }}>
        <Button className="mb">Chat</Button>
        <Button className="mb">More</Button>
        <Button className="mb">3</Button>
      </div>
    )
  }
}

Buttons.defaultProps = {
  buttonsOffset: 10,
}

Buttons.propTypes = {
  brain: PropTypes.instanceOf(Object).isRequired,
  buttonsWidth: PropTypes.number.isRequired,
  buttonsOffset: PropTypes.number,
}
