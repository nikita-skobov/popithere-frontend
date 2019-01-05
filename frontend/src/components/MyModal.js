import React, { Component } from 'react'
import {
  Modal,
  ModalHeader,
  ModalBody,
} from 'reactstrap'

import PropTypes from 'prop-types'

import MyModalBody from './MyModalBody'

export default class MyModal extends Component {
  constructor(props) {
    super(props)
    this.brain = props.brain

    this.state = {
      modal: (props.startingModal && 1) || false,
      type: props.startingModal,
    }

    this.brain.store('MyModal', this)

    this.toggle = this.toggle.bind(this)
    this.isOpen = this.isOpen.bind(this)
  }

  // FUNCTIONS ACCESSIBLE BY GAME CLASS
  isOpen() {
    const { modal } = this.state
    return modal
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
  // END OF FUNCTIONS ACCESSIBLE BY GAME CLASS

  render() {
    const { modal } = this.state
    const { type } = this.state
    const isObj = typeof type === 'object'
    console.log(type)
    let closeable = true
    if (isObj && type.notCloseable) closeable = false
    return (
      <Modal isOpen={modal} toggle={this.toggle} backdrop={false} fade={false}>
        <ModalHeader toggle={closeable && this.toggle}>
          {type === 'options' && (
            'Options'
          )}
          {isObj && (
            type.modalTitle || type.text
          )}
        </ModalHeader>
        <ModalBody>
          <MyModalBody brain={this.brain} type={type} />
        </ModalBody>
      </Modal>
    )
  }
}

MyModal.defaultProps = {
  startingModal: '',
}

MyModal.propTypes = {
  brain: PropTypes.instanceOf(Object).isRequired,
  startingModal: PropTypes.instanceOf(Object),
}
