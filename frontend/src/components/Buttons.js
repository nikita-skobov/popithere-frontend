import React, { Component } from 'react'
import PropTypes from 'prop-types'

import {
  ButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap'

export default class Buttons extends Component {
  constructor(props) {
    super(props)
    this.buttonsWidth = props.buttonsWidth
    this.buttonsOffset = props.buttonsOffset
    this.brain = props.brain

    this.state = {
      leftPx: 0,
      open: false,
    }

    this.brain.store('Buttons', this)

    this.adjust = this.adjust.bind(this)
    this.toggleDropdown = this.toggleDropdown.bind(this)
  }

  componentDidMount() {
    try {
      const size = this.brain.ask.Canvas.leaflet.offsetWidth
      this.adjust(size)
    } catch (e) {
      // do nothing
    }
  }

  toggleDropdown() {
    const { open } = this.state
    this.setState({ open: !open })
  }

  adjust(size) {
    const leftPx = size - this.btn.offsetWidth
    if (this.state.leftPx !== leftPx) {
      // only set state if it is different from the last state
      this.setState({ leftPx })
    }
  }

  render() {
    const { toggleDropdown } = this
    const { leftPx, open } = this.state

    return (
      <div ref={(btn) => { this.btn = btn }} className="my-buttons" style={{ left: leftPx }}>
        <ButtonDropdown direction="left" isOpen={open} toggle={toggleDropdown}>
          <DropdownToggle className="btn-override">
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
