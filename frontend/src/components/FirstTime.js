import React, { Component } from 'react'
import PropTypes from 'prop-types'

import {
  UncontrolledCarousel,
} from 'reactstrap'

const has = Object.prototype.hasOwnProperty

export default class FirstTime extends Component {
  constructor(props) {
    super(props)
    this.brain = props.brain

    this.brain.store('FirstTime', this)

    this.handleButton = this.handleButton.bind(this)

    this.items = [
      {
        src: '/images/temp/longgif.gif',
        header: 'This is a quick slideshow on how to use the site',
      },
    ]
  }

  handleButton(e) {
    e.preventDefault()
  }

  render() {
    return (
      <UncontrolledCarousel autoPlay={false} items={this.items} />
    )
  }
}

FirstTime.propTypes = {
  brain: PropTypes.instanceOf(Object).isRequired,
}
