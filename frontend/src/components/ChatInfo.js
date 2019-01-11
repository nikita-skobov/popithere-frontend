import React, { Component } from 'react'
import PropTypes from 'prop-types'

import {
  ButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap'

const has = Object.prototype.hasOwnProperty

export default class ChatInfo extends Component {
  constructor(props) {
    super(props)
    this.brain = props.brain

    this.username = props.username
    this.message = props.message
    this.src = props.src

    this.brain.store('ChatInfo', this)
  }

  render() {
    const { username, message, src } = this
    return (
      <div>
        <img src={src} alt="dsadsa" />
        You are viewing a message from {username}
        <div>
          {message}
        </div>
      </div>
    )
  }
}

ChatInfo.propTypes = {
  brain: PropTypes.instanceOf(Object).isRequired,
  src: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired,
}
