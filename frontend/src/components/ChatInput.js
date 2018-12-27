/* global document */
import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { InputGroup, Input, InputGroupAddon, Button } from 'reactstrap'

import Buttons from './Buttons'

export default class ChatInput extends Component {
  constructor(props) {
    super(props)
    this.brain = props.brain

    this.brain.store('ChatInput', this)

    this.onSubmit = this.onSubmit.bind(this)
  }

  onSubmit(e) {
    e.preventDefault()
    const { Sockets } = this.brain.ask
    const socket = Sockets
    if (socket.isConnected()) {
      document.activeElement.blur()
      const input = e.target.getElementsByTagName('input')[0]
      const { value } = input
      input.value = ''
      socket.emit('ci', value)
      // const chat = {
      //   name: 'Johhnuyyy',
      //   msg: value,
      // }

      // this.brain.tell.ChatBox.addChat(chat)
    }
  }

// <Buttons buttonsWidth={80} brain={this.brain} />,

  render() {
    return (
      <form action="#" onSubmit={this.onSubmit}>
        <InputGroup className="input-margins">
          <InputGroupAddon addonType="prepend">
            <Buttons buttonsWidth={80} brain={this.brain} />
          </InputGroupAddon>
          <Input placeholder="Send a message" />
          <InputGroupAddon addonType="append">
            <Button>Chat</Button>
          </InputGroupAddon>
        </InputGroup>
      </form>
    )
  }
}

ChatInput.propTypes = {
  brain: PropTypes.instanceOf(Object).isRequired,
}
