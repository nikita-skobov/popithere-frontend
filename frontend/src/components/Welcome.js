import React, { Component } from 'react'
import PropTypes from 'prop-types'

export default class Welcome extends Component {
  constructor(props) {
    super()
    this.brain = props.brain

    this.state = {
      messages: [props.initialMessage],
      warnings: [],
      ready: true,
    }

    this.brain.store('Welcome', this)
    this.addMessage = this.addMessage.bind(this)
  }

  addMessage(msg) {
    if (typeof msg === 'string') {
      // if its just a string, add to messages, dont affect ready
      this.setState((prevState) => {
        const tempState = prevState
        tempState.messages.push(msg)
        return tempState
      })
    } else {
      // otherwise its an object
      const str = msg.msg
      const { warning } = msg
      this.setState((prevState) => {
        const tempState = prevState
        tempState.warnings.push(warning)
        tempState.messages.push(str)
        tempState.ready = false
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
