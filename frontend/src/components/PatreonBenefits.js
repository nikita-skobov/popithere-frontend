import React, { Component } from 'react'
import PropTypes from 'prop-types'

import {
  ButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Row,
  Col,
} from 'reactstrap'

import { benefitTiers } from '../customConfig'

const has = Object.prototype.hasOwnProperty

export default class PatreonBenefits extends Component {
  constructor(props) {
    super(props)
    this.brain = props.brain

    const tm = this.brain.ask.Tokens

    const claims = {
      pit: tm.getClaim('pit'),
      cht: tm.getClaim('cht'),
      myo: tm.getClaim('myo'),
    }

    console.log(claims)

    let tierLevel = 'notoken'
    if (claims.pit && claims.cht && claims.myo) {
      tierLevel = 'notier'
    }

    if (tierLevel === 'notier' && claims.pit > benefitTiers.notier.pit
    && claims.cht > benefitTiers.notier.cht && claims.myo > benefitTiers.notier.myo) {
      tierLevel = 'basic'
    }

    if (tierLevel === 'basic' && claims.pit >= benefitTiers.basic.pit
    && claims.cht >= benefitTiers.basic.cht && claims.myo >= benefitTiers.basic.myo) {
      tierLevel = 'premium'
    }

    this.state = {
      tierLevel,
    }

    this.brain.store('PatreonBenefits', this)

    this.handleButton = this.handleButton.bind(this)
  }

  handleButton(e) {
    e.preventDefault()
  }

  render() {
    const { tierLevel } = this.state
    return (
      <Col fluid>
        <Row>
          <Col>
          {`your tier level: ${tierLevel}`}
          </Col>
          <Col>
          </Col>
          <Col>
          </Col>
        </Row>
      </Col>
    )
  }
}

PatreonBenefits.propTypes = {
  brain: PropTypes.instanceOf(Object).isRequired,
}
