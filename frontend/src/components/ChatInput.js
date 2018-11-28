/* global window */
import React, { Component } from 'react'
import PropTypes from 'prop-types'

export default class ChatInput extends Component {
  constructor(props) {
    super(props)
    this.brain = props.brain

    this.brain.store('ChatInput', this)
  }

  render() {
    return <div />
  }
}

ChatInput.propTypes = {
  brain: PropTypes.instanceOf(Object).isRequired,
}
