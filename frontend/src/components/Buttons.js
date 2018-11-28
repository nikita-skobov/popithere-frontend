/* global window */
import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { Button, ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap'

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
      open: false,
    }

    this.brain.store('Buttons', this)

    this.adjust = this.adjust.bind(this)
    this.toggleDropdown = this.toggleDropdown.bind(this)
  }

  componentDidMount() {
    try {
      const size = this.brain.ask.Canvas.leaflet.offsetWidth
      this.moveButtons(null, size)
    } catch (e) {
      // do nothing
    }
  }

  toggleDropdown() {
    const { open } = this.state
    this.setState({ open: !open })
  }

  moveButtons(orientation, size) {
    const leftPx = size - this.btn.offsetWidth
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
    const { buttonsWidth, toggleDropdown } = this
    const { leftPx, orientation, open } = this.state

    return (
      <div ref={(btn) => { this.btn = btn }} className="my-buttons" style={{ left: leftPx }}>
        <ButtonDropdown direction="left" isOpen={open} toggle={toggleDropdown}>
          <DropdownToggle>
            <i className="fa fa-bars" />
          </DropdownToggle>
          <DropdownMenu>
            <DropdownItem>Chat</DropdownItem>
            <DropdownItem>Some other stuff</DropdownItem>
            <DropdownItem>Support</DropdownItem>
          </DropdownMenu>
        </ButtonDropdown>
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
