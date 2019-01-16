import React, { Component } from 'react'
import PropTypes from 'prop-types'

import {
  Row,
  Col,
  Card,
  CardTitle,
  CardText,
  Button,
  Input,
  InputGroup,
  InputGroupAddon,
} from 'reactstrap'

import { benefitTiers, patreonEndpoint, patreonClientId, patreonPage } from '../customConfig'

const has = Object.prototype.hasOwnProperty

export default class PatreonBenefits extends Component {
  constructor(props) {
    super(props)
    this.brain = props.brain
    this.brain.store('PatreonBenefits', this)

    this.handleBenefit = this.handleBenefit.bind(this)

    const tm = this.brain.ask.Tokens

    const claims = {
      pit: tm.getClaim('pit'),
      cht: tm.getClaim('cht'),
      myo: tm.getClaim('myo'),
      // for debugging purposes. REMOVE THIS LATER
      tts: tm.getClaim('tts') ? tm.getClaim('tts') : 0,
    }

    console.log(claims)

    let tierLevel = 'notoken'
    if (claims.pit && claims.cht && claims.myo && claims.tts === 0) {
      tierLevel = 'notier'
    }

    if (tierLevel === 'notier' && claims.pit > benefitTiers.notier.pit
    && claims.cht > benefitTiers.notier.cht && claims.myo > benefitTiers.notier.myo
    && claims.tts > benefitTiers.notier.tts) {
      tierLevel = 'basic'
    }

    if (tierLevel === 'basic' && claims.pit > benefitTiers.basic.pit
    && claims.cht > benefitTiers.basic.cht && claims.myo > benefitTiers.basic.myo
    && claims.tts > benefitTiers.basic.tts) {
      tierLevel = 'premium'
    }

    this.state = {
      tierLevel: 'premium',
      redirect: props.redirect,
    }

    const username = tm.getClaim('id')

    if (!username) {
      this.patreonAuthorization = '#'
    } else {
      this.patreonAuthorization = `https://www.patreon.com/oauth2/authorize?state=${username}&response_type=code&scope=identity%20campaigns.members&client_id=${patreonClientId}&redirect_uri=${patreonEndpoint}`
    }
  }

  handleBenefit(e) {
    e.preventDefault()
    const limiter = this.brain.ask.LimitManager
    const action = limiter.canPerformAction('tts')
    const { allowed } = action
    console.log(action)
    console.log(allowed)
  }

  render() {
    const { tierLevel, redirect } = this.state

    const makeList = (benefitObj, tierName) => (
      <ul className="pl1em">
        <li>Chat messages: {`${benefitObj.cht}`} every 5 seconds</li>
        <li>Place PopIts: {`${benefitObj.pit}`} every 5 seconds</li>
        <li>Make your own PopIts: {`${benefitObj.myo}`} every 30 minutes</li>
        {tierName === 'premium' && (
          <li>Send text-to-speech alerts: {`${benefitObj.tts}`} every 30 minutes</li>
        )}
      </ul>
    )

    const makeCard = (tierName, tierText) => (
      <Col>
        <Card body inverse={tierLevel === tierName} outline={tierLevel !== tierName} color="success">
          <CardTitle>{tierText} {tierLevel === tierName && <h6>(This is your tier)</h6>}</CardTitle>
          <CardText>You are allowed to: </CardText>
          {makeList(benefitTiers[tierName], tierName)}
          <CardText>Price: {benefitTiers[tierName].price}</CardText>
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
        {!redirect && [
          <Row>
            <Col>
              <h6>If you are a patron, you have access to benefits on this site. All you need to do is click the {'"Log in with Patreon"'} button, which will unlock your benefits for this specific device. If you have multiple devices, you just need to click this button again on your other devices.</h6>
            </Col>
          </Row>,
          <Row className="mb1em">
            <a className="ma" href={this.patreonAuthorization}>
              <Button disabled={tierLevel === 'notoken'} className="btn-patreon">Log in with Patreon</Button>
            </a>
          </Row>,
          <Row>
            <Col>
              <h6>If you are not a patron, you can become a patron on my patreon page by clicking the button below. Afterwards, come back here, and click the {'"Log in with Patreon"'} button above to get your benefits.</h6>
            </Col>
          </Row>,
          <Row className="mb1em">
            <a className="ma" href={patreonPage}>
              <Button className="btn-patreon">Become a Patron</Button>
            </a>
          </Row>,
        ]}
        <Row className={!redirect ? 'cool-bottom-line pb1em' : ''}>
          {makeCard('notier', 'No Tier')}
          {makeCard('basic', 'Basic Tier')}
          {makeCard('premium', 'Premium Tier')}
        </Row>
        {!redirect && (
          <Col className={`pt1em ${tierLevel !== 'premium' ? 'grey-out' : ''}`} fluid>
            <Row className="mbhalfem">
              <h5>Text To Speech {tierLevel !== 'premium' ? '(Only for Premium Tier)' : ''}</h5>
            </Row>
            <Row>
              <InputGroup>
                <Input type="text" placeholder="Enter your text here" />
                <InputGroupAddon addonType="append">
                  <Button onClick={this.handleBenefit}>Submit</Button>
                </InputGroupAddon>
              </InputGroup>
            </Row>
          </Col>
        )}
      </Col>
    )
  }
}

PatreonBenefits.defaultProps = {
  redirect: false,
}

PatreonBenefits.propTypes = {
  brain: PropTypes.instanceOf(Object).isRequired,
  redirect: PropTypes.bool,
}
