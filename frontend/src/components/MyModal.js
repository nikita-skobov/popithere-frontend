import React, { Component } from 'react'
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
} from 'reactstrap'

import PropTypes from 'prop-types'

export default class MyModal extends Component {
  constructor(props) {
    super(props)
    this.brain = props.brain

    this.state = {
      modal: false,
      type: '',
    }

    this.brain.store('MyModal', this)

    this.toggle = this.toggle.bind(this)
  }

  toggle(type) {
    this.setState((prevState) => {
      const tempState = prevState
      if (type) {
        tempState.type = type
      }
      let { modal } = prevState
      modal = !modal
      tempState.modal = modal
      return tempState
    })
  }

  render() {
    const { modal } = this.state
    const { type } = this.state
    return (
      <Modal isOpen={modal} toggle={this.toggle} backdrop={false} fade={false}>
        <ModalHeader toggle={this.toggle}>
          {type === 'options' && (
            'Options'
          )}
        </ModalHeader>
        <ModalBody>
          {type === 'options' && (
            <Button>some options here</Button>
          )}
        </ModalBody>
      </Modal>
    )
  }
}

MyModal.propTypes = {
  brain: PropTypes.instanceOf(Object).isRequired,
}
