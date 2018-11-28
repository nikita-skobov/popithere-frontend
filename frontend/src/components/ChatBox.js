/* global window */
import React, { Component } from 'react'
import PropTypes from 'prop-types'

export default class ChatBox extends Component {
  constructor(props) {
    super(props)
    this.brain = props.brain

    this.state = {
      maxHeight: 300,
      chats: [
        {
          name: 'olive oil',
          msg: 'asdsadsadsadsadsa',
        },
      ],
    }

    this.brain.store('ChatBox', this)
    this.addChat = this.addChat.bind(this)
  }

  componentDidMount() {
    const size = this.brain.ask.Canvas.leaflet.offsetHeight
    this.setState({ maxHeight: size * 0.9 })
  }

  addChat(chat) {
    this.setState((prevState) => {
      prevState.chats.push(chat)
      return prevState
    })
  }

  render() {
    const { chats, maxHeight } = this.state
    return (
      <div className="input-margins chat-box" style={{ maxHeight }}>
        {chats.slice(0).reverse().map((item) => {
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
