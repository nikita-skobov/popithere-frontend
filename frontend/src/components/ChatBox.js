/* global window */
import React, { Component } from 'react'
import PropTypes from 'prop-types'

export default class ChatBox extends Component {
  constructor(props) {
    super(props)
    this.brain = props.brain

    this.brain.store('ChatBox', this)

    this.onSubmit = this.onSubmit.bind(this)
  }


  render() {
    return (
      <div />
    )
  }
}

ChatBox.propTypes = {
  brain: PropTypes.instanceOf(Object).isRequired,
}
