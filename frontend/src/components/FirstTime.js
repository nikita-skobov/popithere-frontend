import React, { Component } from 'react'
import PropTypes from 'prop-types'

import {
  Carousel,
  CarouselItem,
  CarouselControl,
  Col,
  Row,
  Button,
} from 'reactstrap'

import { firstTimeItems } from '../customConfig'

export default class FirstTime extends Component {
  constructor(props) {
    super(props)
    this.brain = props.brain

    this.brain.store('FirstTime', this)

    this.state = {
      activeIndex: 0,
    }

    this.next = this.next.bind(this)
    this.previous = this.previous.bind(this)
    this.onExiting = this.onExiting.bind(this)
    this.onExited = this.onExited.bind(this)

    this.items = firstTimeItems.latest
  }

  onExiting() {
    this.animating = true
  }

  onExited() {
    this.animating = false
  }

  next() {
    if (this.animating) return
    const { activeIndex } = this.state
    const nextIndex = activeIndex === this.items.length - 1 ? 0 : activeIndex + 1
    this.setState({ activeIndex: nextIndex })
  }

  previous() {
    if (this.animating) return
    const { activeIndex } = this.state
    const nextIndex = activeIndex === 0 ? this.items.length - 1 : activeIndex - 1
    this.setState({ activeIndex: nextIndex })
  }

  render() {
    const { activeIndex } = this.state
    const slides = this.items.map(item => (
      <CarouselItem
        onExiting={this.onExiting}
        onExited={this.onExited}
        key={item.src}
      >
        <img key={item.src} className="w100" src={item.src} alt={item.altText} />
      </CarouselItem>
    ))

    return (
      <Col fluid>
        <Row className="pb1em">
          <Carousel
            activeIndex={activeIndex}
            next={this.next}
            previous={this.previous}
            interval={false}
          >
            {slides}
          </Carousel>
        </Row>
        <Row>
          <div className="dil w10p">
            <Button onClick={this.previous} disabled={activeIndex <= 0} className="btn-popithere half-trans floatleft">
              {'<'}
            </Button>
          </div>
          <div className="dil w80p pshalfem">
            <h5 className="text-center" key={activeIndex}>
              {firstTimeItems.latest[activeIndex].header}
            </h5>
          </div>
          <div className="dil w10p">
            <Button onClick={this.next} disabled={activeIndex >= this.items.length - 1} className="btn-popithere half-trans floatright">
              {'>'}
            </Button>
          </div>
        </Row>
      </Col>
    )
  }
}

FirstTime.propTypes = {
  brain: PropTypes.instanceOf(Object).isRequired,
}
