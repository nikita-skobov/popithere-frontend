import React, { Component } from 'react'
import PropTypes from 'prop-types'

export default class Welcome extends Component {
  constructor(props) {
    super()
    this.brain = props.brain

    this.state = {
      messages: [props.initialMessage],
      warnings: [],
      errors: [],
      ready: true,
    }

    this.brain.store('Welcome', this)
    this.addMessage = this.addMessage.bind(this)
  }

  addMessage(msg, notReady) {
    if (typeof msg === 'string') {
      // if its just a string, add to messages
      this.setState((prevState) => {
        const tempState = prevState
        tempState.messages.push(msg)
        if (notReady) tempState.ready = false
        return tempState
      })
    } else {
      // otherwise its an object
      const { warning, error, message } = msg
      this.setState((prevState) => {
        const tempState = prevState
        if (warning) tempState.warnings.push(warning)
        if (error) tempState.errors.push(error)
        if (message) tempState.messages.push(message)
        if (notReady) tempState.ready = false
        return tempState
      })
    }
  }

  render() {
    console.log('rendering welcome')
    const { messages } = this.state
    return messages.map(msg => <div>{msg}</div>)
  }
}

Welcome.propTypes = {
  brain: PropTypes.instanceOf(Object).isRequired,
  initialMessage: PropTypes.string.isRequired,
}
