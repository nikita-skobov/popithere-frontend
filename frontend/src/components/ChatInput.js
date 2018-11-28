/* global document */
import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { InputGroup, Input, InputGroupAddon, Button } from 'reactstrap'

export default class ChatInput extends Component {
  constructor(props) {
    super(props)
    this.brain = props.brain

    this.brain.store('ChatInput', this)

    this.onSubmit = this.onSubmit.bind(this)
  }

  onSubmit(e) {
    e.preventDefault()
    document.activeElement.blur()
    const input = e.target.getElementsByTagName('input')[0]
    const { value } = input
    input.value = ''

    const chat = {
      name: 'Johhnuyyy',
      msg: value,
    }

    this.brain.tell.ChatBox.addChat(chat)
  }

  render() {
    return (
      <form action="#" onSubmit={this.onSubmit}>
        <InputGroup className="input-margins">
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
