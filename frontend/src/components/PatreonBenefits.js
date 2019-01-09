import React, { Component } from 'react'
import PropTypes from 'prop-types'

import {
  ButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Row,
  Col,
  Card,
  CardTitle,
  CardText,
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

    const makeList = benefitObj => (
      <ul>
        <li>Chat messages: {`${benefitObj.cht}`} every 5 seconds</li>
        <li>Place PopIts: {`${benefitObj.pit}`} every 5 seconds</li>
        <li>Make your own PopIts: {`${benefitObj.myo}`} every 30 minutes</li>
      </ul>
    )

    const makeCard = (tierName, tierText) => (
      <Col>
        <Card body inverse={tierLevel === tierName} outline={tierLevel !== tierName} color="success">
          <CardTitle>{tierText} {tierLevel === tierName && <h6>(This is your tier)</h6>}</CardTitle>
          {makeList(benefitTiers[tierName])}
        </Card>
      </Col>
    )

    return (
      <Col fluid>
        {tierLevel === 'notoken' && (
          <Row>
            <h3 className="text-center">You are using this site without a token. You cannot link your patreon account until you aquire a token. Please try refreshing the page. If this issue persists, please contact equilateralllc@gmail.com</h3>
          </Row>
        )}
        <Row>
          {makeCard('notier', 'No Tier')}
          {makeCard('basic', 'Basic Tier')}
          {makeCard('premium', 'Premium Tier')}
        </Row>
      </Col>
    )
  }
}

PatreonBenefits.propTypes = {
  brain: PropTypes.instanceOf(Object).isRequired,
}
