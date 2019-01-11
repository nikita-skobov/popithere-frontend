import React, { Component } from 'react'
import PropTypes from 'prop-types'

import {
  ButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap'

import PatreonBenefits from './PatreonBenefits'

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

    this.defaultModals = {
      benefits: {
        text: 'You can get extra benefits if you become a patron!',
        size: 'lg',
        modal: () => (
          <PatreonBenefits brain={this.brain} />
        ),
      },
      about: {
        text: 'About',
        size: 'lg',
        modal: () => (
          <div>
            <h3>yur poooop lmao</h3>
          </div>
        ),
      },
    }
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
      if (name === 'mutechat') {
        this.brain.tell.ChatBox.toggleMuteChat()
        console.log('muting chat')
      } else if (has.call(this.defaultModals, name)) {
        this.brain.tell.MyModal.toggle(this.defaultModals[name])
      } else {
        this.brain.tell.MyModal.toggle(name)
      }
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
    const isChatMuted = this.brain.ask.ChatBox && this.brain.ask.ChatBox.isChatMuted()
    const muteChatText = isChatMuted ? 'Unmute Chat' : 'Mute Chat'

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
          <DropdownItem name="mutechat" onClick={this.handleButton}>{muteChatText}</DropdownItem>
          <DropdownItem name="benefits" onClick={this.handleButton}>Benefits</DropdownItem>
          <DropdownItem name="about" onClick={this.handleButton}>About</DropdownItem>
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
