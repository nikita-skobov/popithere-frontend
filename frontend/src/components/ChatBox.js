/* global window */
import React, { Component } from 'react'
import PropTypes from 'prop-types'

export default class ChatBox extends Component {
  constructor(props) {
    super(props)
    this.brain = props.brain

    this.state = {
      chats: [
        {
          name: 'olive oil',
          msg: 'asdsadsadsadsadsa',
        },
      ],
    }

    this.brain.store('ChatBox', this)
  }


  render() {
    const { chats } = this.state
    return (
      <div className="input-margins chat-box">
        {chats.reverse().map((item) => {
          const { name, msg } = item
          return <div> <span>{name}</span>: {msg} </div>
        })}
      </div>
    )
  }
}

ChatBox.propTypes = {
  brain: PropTypes.instanceOf(Object).isRequired,
}
