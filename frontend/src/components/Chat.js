import React, { Component } from 'react'
import PropTypes from 'prop-types'

export default class Chat extends Component {
  constructor(props) {
    super(props)
    this.brain = props.brain

    this.brain.store('Chat', this)
  }

  render() {
    return (
      <div>
        fdsa
      </div>
    )
  }
}

Chat.propTypes = {
  brain: PropTypes.instanceOf(Object).isRequired,
}
