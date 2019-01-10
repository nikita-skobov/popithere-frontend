import React, { Component } from 'react'
import PropTypes from 'prop-types'

import {
  ButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap'

import AlertItem from './AlertItem'

const has = Object.prototype.hasOwnProperty

export default class AlertSystem extends Component {
  constructor(props) {
    super(props)
    this.brain = props.brain

    this.state = {
      open: false,
      alerts: [],
    }

    this.brain.store('AlertSystem', this)

    this.handleButton = this.handleButton.bind(this)
  }

  handleButton(e) {
    e.preventDefault()
  }

  render() {
    const { open, alerts } = this.state
    if (!open) return null

    return <AlertItem data={alerts[alerts.length - 1]} brain={this.brain} />
  }
}

AlertSystem.propTypes = {
  brain: PropTypes.instanceOf(Object).isRequired,
}
