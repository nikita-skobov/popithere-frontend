import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { Button } from 'reactstrap'

export default class Buttons extends Component {
  constructor(props) {
    super(props)
    this.buttonsWidth = props.buttonsWidth
    this.buttonsOffset = props.buttonsOffset
    this.brain = props.brain

    this.state = {
      leftPx: 0,
    }

    this.brain.store('Buttons', this)

    this.adjust = this.adjust.bind(this)
  }

  adjust(size, changePos) {
    if (!changePos) {
      const leftPx = size + (this.buttonsWidth / 2) + this.buttonsOffset
      if (this.state.leftPx !== leftPx) {
        this.setState({ leftPx })
      }
    }
  }

  render() {
    const { buttonsWidth } = this
    const { leftPx } = this.state
    return (
      <div className="my-buttons" style={{ left: leftPx, width: buttonsWidth }}>
        <Button>Chat</Button>
        <Button>More</Button>
        <Button>3</Button>
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
