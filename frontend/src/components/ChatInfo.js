import React, { Component } from 'react'
import PropTypes from 'prop-types'

import {
  ButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Row,
  Col,
  Button,
} from 'reactstrap'

const has = Object.prototype.hasOwnProperty

export default class ChatInfo extends Component {
  constructor(props) {
    super(props)
    this.brain = props.brain

    this.username = props.username
    this.message = props.message
    this.src = props.src

    this.state = {
      isMuted: props.ismuted,
    }

    this.handleMute = this.handleMute.bind(this)
    // this.handleReport = this.handleReport.bind(this)

    this.brain.store('ChatInfo', this)
  }

  handleMute(e) {
    e.preventDefault()
    const { username } = this
    const { isMuted } = this.state
    this.setState((prevState) => {
      const tempState = prevState
      if (!isMuted) {
        this.brain.tell.ChatBox.muteUser(username)
        tempState.isMuted = true
      } else {
        this.brain.tell.ChatBox.unmuteUser(username)
        tempState.isMuted = false
      }
      return tempState
    })
  }

  render() {
    const { src } = this
    const { isMuted } = this.state
    const muteString = isMuted ? 'Unmute User' : 'Mute User'
    return (
      <Col fluid>
        <Row className="mb1em">
          <img className="ma h150px" src={src} alt="some alt" />
        </Row>
        <Row>
          <Button onClick={this.handleMute} className="mr1em" color="danger">{muteString}</Button>
          {/* <Button className="mr1em" color="danger">Report User</Button> */}
        </Row>
      </Col>
    )
  }
}

ChatInfo.propTypes = {
  brain: PropTypes.instanceOf(Object).isRequired,
  src: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired,
  ismuted: PropTypes.bool.isRequired,
}
