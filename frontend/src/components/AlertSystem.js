import React, { Component } from 'react'
import PropTypes from 'prop-types'

import {
  ButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap'

const has = Object.prototype.hasOwnProperty

export default class AlertSystem extends Component {
  constructor(props) {
    super(props)
    this.brain = props.brain

    this.state = {
      open: false,
    }

    this.brain.store('AlertSystem', this)

    this.handleButton = this.handleButton.bind(this)
  }

  handleButton(e) {
    e.preventDefault()
  }

  render() {
    return (
      <div>dsadsa</div>
    )
  }
}

AlertSystem.propTypes = {
  brain: PropTypes.instanceOf(Object).isRequired,
}
