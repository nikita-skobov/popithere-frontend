import React, { Component } from 'react'
import PropTypes from 'prop-types'

import {
  Row,
  Col,
} from 'reactstrap'

import Slider from 'rc-slider'

const has = Object.prototype.hasOwnProperty

export default class Options extends Component {
  constructor(props) {
    super(props)
    this.brain = props.brain

    this.brain.store('Options', this)

    this.state = {
      volume: this.brain.ask.SoundManager.getVolume() * 100,
    }

    this.handleVolume = this.handleVolume.bind(this)
  }

  handleVolume(newVol) {
    this.setState({ volume: newVol })
    this.brain.tell.SoundManager.changeVolume(newVol / 100)
  }

  render() {
    const { volume } = this.state

    return (
      <Col fluid>
        <Row>
          Volume
        </Row>
        <Row className="pb1em">
          <Slider onChange={this.handleVolume} min={0} max={100} defaultValue={volume} marks={{ 0: 0, 100: 100 }} />
        </Row>
      </Col>
    )
  }
}

Options.propTypes = {
  brain: PropTypes.instanceOf(Object).isRequired,
}
