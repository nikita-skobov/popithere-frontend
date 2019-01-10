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
      width: 100,
    }

    this.brain.store('AlertSystem', this)

    this.handleButton = this.handleButton.bind(this)
    this.addAlert = this.addAlert.bind(this)
    this.endAlert = this.endAlert.bind(this)
    this.reposition = this.reposition.bind(this)

    this.brain.onResize(this.reposition)
  }

  componentDidMount() {
    this.reposition()
  }

  handleButton(e) {
    e.preventDefault()
  }

  addAlert(obj) {
    console.log(this.brain.ask.Canvas)
    console.log(this.brain.ask.Canvas.leaflet)
    this.setState((prevState) => {
      const tempState = prevState

      const { open } = tempState
      if (!open) {
        tempState.open = true
      }

      tempState.alerts.push(obj)
      return tempState
    })
  }

  endAlert() {
    this.setState((prevState) => {
      const tempState = prevState

      // removes from beginning
      tempState.alerts.shift()

      if (!tempState.alerts.length) {
        tempState.open = false
      }

      return tempState
    })
  }

  reposition() {
    const canvasWidth = this.brain.ask.Canvas.leaflet.offsetWidth
    this.setState({ width: canvasWidth })
  }

  render() {
    const { open, alerts, width } = this.state
    if (!open) return null

    return (
      <div style={{ position: 'absolute', top: '0px', width }}>
        <AlertItem key={alerts[0].text} data={alerts[0]} brain={this.brain} />
      </div>
    )
  }
}

AlertSystem.propTypes = {
  brain: PropTypes.instanceOf(Object).isRequired,
}
