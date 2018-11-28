/* global window */
import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { InputGroup, Input, InputGroupAddon, Button } from 'reactstrap'

export default class ChatInput extends Component {
  constructor(props) {
    super(props)
    this.brain = props.brain

    this.brain.store('ChatInput', this)
  }

  render() {
    return (
      <InputGroup className="input-margins">
        <Input placeholder="Send a message" />
        <InputGroupAddon addonType="append">
          <Button>Chat</Button>
        </InputGroupAddon>
      </InputGroup>
    )
  }
}

ChatInput.propTypes = {
  brain: PropTypes.instanceOf(Object).isRequired,
}
