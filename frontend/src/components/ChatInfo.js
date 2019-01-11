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

    this.brain.store('ChatInfo', this)
  }

  render() {
    const { src } = this
    return (
      <Col fluid>
        <Row className="mb1em">
          <img className="ma" src={src} alt="some alt" />
        </Row>
        <Row>
          <Button className="mr1em" color="danger">Mute User</Button>
          <Button className="mr1em" color="danger">Report User</Button>
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
}
