import React, { Component } from 'react'
import PropTypes from 'prop-types'

import AlertItem from './AlertItem'

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

    this.addAlert = this.addAlert.bind(this)
    this.endAlert = this.endAlert.bind(this)
    this.reposition = this.reposition.bind(this)
    this.updateList = this.updateList.bind(this)
    this.isAlertOpen = this.isAlertOpen.bind(this)

    this.brain.onResize(this.reposition)
  }

  componentDidMount() {
    setTimeout(() => {
      this.reposition()
    }, 3000)
  }

  addAlert(obj) {
    let settingOpen = false
    this.setState((prevState) => {
      const tempState = prevState

      const { open } = tempState
      if (!open) {
        tempState.open = true
        settingOpen = true
      } else {
        // if it is already open, then increment the wait list
        this.brain.tell.AlertItem.addWaiting()
      }

      tempState.alerts.push({
        random: Math.random(),
        ...obj,
      })
      return tempState
    }, () => {
      if (settingOpen) {
        try {
          const size = this.brain.ask.Canvas.leaflet.offsetHeight
          this.brain.tell.Chat.adjust(size)
        } catch (e) {
          // do nothing
        }
      }
    })
  }

  isAlertOpen() {
    const { open } = this.state
    return open
  }

  updateList() {
    let settingClosed = false
    this.setState((prevState) => {
      const tempState = prevState

      // removes from beginning
      tempState.alerts.shift()

      if (!tempState.alerts.length) {
        tempState.open = false
        settingClosed = true
      }

      return tempState
    }, () => {
      if (settingClosed) {
        try {
          const size = this.brain.ask.Canvas.leaflet.offsetHeight
          this.brain.tell.Chat.adjust(size)
        } catch (e) {
          // do nothing
        }
      }
    })
  }

  endAlert() {
    this.brain.tell.AlertItem.endAlert(() => {
      this.updateList()
    })
  }

  reposition() {
    const canvasWidth = this.brain.ask.Canvas.leaflet.offsetWidth
    this.setState({ width: canvasWidth })
  }

  render() {
    const { open, alerts } = this.state
    if (!open) return null

    const waiting = alerts.length - 1

    return (
      <div>
        <AlertItem key={`${alerts[0].random}.${alerts[0].text}`} data={alerts[0]} waiting={waiting} brain={this.brain} />
      </div>
    )
  }
}

AlertSystem.propTypes = {
  brain: PropTypes.instanceOf(Object).isRequired,
}
