/* global document */
import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { InputGroup, Input, InputGroupAddon, Button } from 'reactstrap'

import ContainsBadWords from '../utils/ContainsBadWords'
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

    const alerts = this.brain.ask.AlertSystem
    const limiter = this.brain.ask.LimitManager
    const action = limiter.canPerformAction('chat')
    const { allowed } = action
    if (allowed && socket.isConnected()) {
      document.activeElement.blur()
      const input = e.target.getElementsByTagName('input')[0]
      const { value } = input
      input.value = ''

      if (!ContainsBadWords(value)) {
        socket.emit('ci', value)
      }
    } else if (!allowed) {
      const { limit, nextTime, interval } = action
      if (!alerts.isAlertOpen()) {
        alerts.addAlert({
          color: 'warning',
          text: `You have reached your limit of ${limit} chat messages per ${Math.floor(interval / 1000)} seconds. You will be able to chat again in about ${typeof nextTime !== 'number' ? 'Infinity' : Math.floor(nextTime / 1000)} seconds`,
          countdown: typeof nextTime !== 'number' ? 5000 : nextTime + 1000,
        })
      }
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
            <Button className="btn-popithere">Chat</Button>
          </InputGroupAddon>
        </InputGroup>
      </form>
    )
  }
}

ChatInput.propTypes = {
  brain: PropTypes.instanceOf(Object).isRequired,
}
