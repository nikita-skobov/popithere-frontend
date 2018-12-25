import React, { Component } from 'react'
import PropTypes from 'prop-types'

import Avatars from '@dicebear/avatars'
import SpriteCollection1 from '@dicebear/avatars-identicon-sprites'
import SpriteCollection2 from '@dicebear/avatars-male-sprites'
import SpriteCollection3 from '@dicebear/avatars-female-sprites'

const avatars1 = new Avatars(SpriteCollection1)
const avatars2 = new Avatars(SpriteCollection2)
const avatars3 = new Avatars(SpriteCollection3)

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

    this.socket = this.brain.ask.Sockets
    if (this.socket.isConnected()) {
      this.socket.on('co', (chatObj) => {
        const newChatObj = {
          name: chatObj.i,
          msg: chatObj.t,
        }
        this.addChat(newChatObj)
      })
    }
  }

  componentDidMount() {
    const size = this.brain.ask.Canvas.leaflet.offsetHeight
    this.setState({ maxHeight: size * 0.9 })
  }

  componentWillUnmount() {
    if (this.socket.isConnected()) {
      this.socket.off('ci')
    }
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
