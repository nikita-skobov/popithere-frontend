import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { Media } from 'reactstrap'

import Avatars from '@dicebear/avatars'
import SpriteCollection1 from '@dicebear/avatars-identicon-sprites'
import SpriteCollection2 from '@dicebear/avatars-male-sprites'
import SpriteCollection3 from '@dicebear/avatars-female-sprites'

const avatars1 = new Avatars(SpriteCollection1)
const avatars2 = new Avatars(SpriteCollection2)
const avatars3 = new Avatars(SpriteCollection3)

const has = Object.prototype.hasOwnProperty

function generateSprite(author) {
  const isCapital = /^[A-Z]/.test(author)
  const isLowerCase = /^[a-z]/.test(author)
  let svg = null
  if (isCapital) {
    // use male avatar
    svg = avatars2.create(author)
  } else if (isLowerCase) {
    // use female avatar
    svg = avatars3.create(author)
  } else {
    // use identicon avatar
    svg = avatars1.create(author)
  }
  let svgstr = encodeURIComponent(svg)
  const dataUri = `data:image/svg+xml,${svgstr}`
  svgstr = null
  svg = null
  return dataUri
}

export default class ChatBox extends Component {
  constructor(props) {
    super(props)
    this.brain = props.brain

    this.state = {
      colorIndex: 0,
      maxHeight: 300,
      maxChatItems: 50,
      chats: [],
    }

    this.brain.store('ChatBox', this)
    this.addChat = this.addChat.bind(this)

    this.socket = this.brain.ask.Sockets
    if (this.socket.isConnected()) {
      this.socket.on('co', this.addChat)
    }

    this.authors = {}
  }

  componentDidMount() {
    const size = this.brain.ask.Canvas.leaflet.offsetHeight
    this.setState({ maxHeight: size * 0.9 })
  }

  componentWillUnmount() {
    if (this.socket.isConnected()) {
      this.socket.off('ci', this.addChat)
    }
  }

  addChat(chat) {
    this.setState((prevState) => {
      const tempState = prevState
      const { colorIndex, maxChatItems } = tempState
      const name = chat.i
      const msg = chat.t
      let svg = ''
      if (has.call(this.authors, name)) {
        // we already generated a sprite, so use it
        svg = this.authors[name]
      } else {
        // generate a new sprite
        svg = generateSprite(name)
        this.authors[name] = svg
      }
      let color = 'white'
      if (colorIndex) {
        color = '#e4e4e4'
        tempState.colorIndex = 0
      } else {
        tempState.colorIndex = 1
      }
      const newChat = {
        name,
        msg,
        svg,
        color,
      }

      if (tempState.chats.length > maxChatItems) {
        tempState.chats.shift()
      }

      tempState.chats.push(newChat)
      return tempState
    })
  }

  render() {
    const { chats, maxHeight } = this.state
    return (
      <div className="input-margins chat-box" style={{ maxHeight }}>
        {chats.slice(0).reverse().map((item) => {
          const { name, msg, svg, color } = item
          return (
            <Media style={{ backgroundColor: color }}>
              <Media style={{ width: '5em' }}>
                <Media meta-name={name} meta-msg={msg} style={{ width: '100%', paddingTop: '10%', paddingBottom: '10%' }} object src={svg} alt="some alt" />
              </Media>
              <Media body style={{ wordBreak: 'break-all', paddingTop: '5%' }}>{msg}</Media>
            </Media>
          )
        })}
      </div>
    )
  }
}

ChatBox.propTypes = {
  brain: PropTypes.instanceOf(Object).isRequired,
}
