import React, { Component } from 'react'

import PropTypes from 'prop-types'

export default class MyModalBody extends Component {
  constructor(props) {
    super(props)
    this.brain = props.brain
    this.type = props.type

    this.brain.store('MyModalBody', this)

    this.handleChange = this.handleChange.bind(this)
  }

  handleChange(e) {
    e.preventDefault()
    const { name, value } = e.target
    const { type } = this
    if (type === 'options') {
      if (name === 'maxspritecount') {
        const num = parseInt(value, 10)
        if (!Number.isNaN(num)) {
          // if user input is actually a number
          this.brain.tell.Canvas.settingsChange(name, num)
        }
      }
    }
  }

  render() {
    const { type } = this
    // const maxSpriteCount = this.brain.ask.Canvas.maxSprites

    if (typeof type === 'object') {
      const ModalBody = type.modal
      return <ModalBody />
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
