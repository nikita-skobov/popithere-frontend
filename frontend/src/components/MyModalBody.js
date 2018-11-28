import React, { Component } from 'react'
import {
  Modal,
  ModalHeader,
  ModalBody,
} from 'reactstrap'

import PropTypes from 'prop-types'

export default class MyModalBody extends Component {
  constructor(props) {
    super(props)
    this.brain = props.brain
    this.type = props.type

    this.brain.store('MyModalBody', this)
  }

  render() {
    const { type } = this

    if (type === 'options') {
      return (
        <div />
      )
    }
    return (
      <div />
    )
  }
}

MyModalBody.propTypes = {
  brain: PropTypes.instanceOf(Object).isRequired,
  type: PropTypes.string.isRequired,
}
