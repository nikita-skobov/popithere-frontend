import React, { Component } from 'react'
import PropTypes from 'prop-types'

import {
  ButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap'

import { defaultButtons } from '../customConfig'

const has = Object.prototype.hasOwnProperty

export default class Buttons extends Component {
  constructor(props) {
    super(props)
    this.buttonsWidth = props.buttonsWidth
    this.buttonsOffset = props.buttonsOffset
    this.brain = props.brain

    this.state = {
      open: false,
      gameButtons: [],
    }

    this.brain.store('Buttons', this)

    this.toggleDropdown = this.toggleDropdown.bind(this)
    this.handleButton = this.handleButton.bind(this)
  }

  newButtons(buttons) {
    this.setState((prevState) => {
      const tempState = prevState
      tempState.gameButtons = buttons
      return tempState
    })
  }

  toggleDropdown() {
    const { open } = this.state
    this.setState({ open: !open })
  }

  handleButton(e) {
    e.preventDefault()
    const { name } = e.target
    // first check for one of the default buttons
    // like options, help, about, etc
    if (defaultButtons.includes(name)) {
      this.brain.tell.MyModal.toggle(name)
    } else {
      // otherwise it is a game buttons defined by user

      // first find the button with that name
      let button = null
      const { gameButtons } = this.state
      gameButtons.forEach((btn) => {
        if (btn.name === name) {
          button = btn
        }
      })

      if (button) {
        // only proceed if button was found

        if (has.call(button, 'on')) {
          button.on()
        }

        if (has.call(button, 'modal')) {
          this.brain.tell.MyModal.toggle(button)
        }
      }
    }
  }

  render() {
    const { toggleDropdown } = this
    const { open, gameButtons } = this.state

    return (
      <ButtonDropdown direction="left" isOpen={open} toggle={toggleDropdown}>
        <DropdownToggle className="btn-override">
          <i className="fa fa-bars" />
        </DropdownToggle>
        <DropdownMenu>
          {gameButtons.map(item => (
            // users can load buttons into the menu dynamically
            <DropdownItem name={item.name} onClick={this.handleButton}>{item.text}</DropdownItem>
          ))}
          <DropdownItem name="options" onClick={this.handleButton}>Options</DropdownItem>
          <DropdownItem>Support</DropdownItem>
        </DropdownMenu>
      </ButtonDropdown>
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
