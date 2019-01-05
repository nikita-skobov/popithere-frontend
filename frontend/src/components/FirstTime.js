import React, { Component } from 'react'
import PropTypes from 'prop-types'

import {
  Carousel,
  CarouselItem,
  CarouselControl,
  CarouselIndicators,
  CarouselCaption
} from 'reactstrap'

import { firstTimeItems } from '../customConfig'

const has = Object.prototype.hasOwnProperty

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

    this.handleButton = this.handleButton.bind(this)

    this.items = firstTimeItems.latest
  }

  handleButton(e) {
    e.preventDefault()
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
    const slides = this.items.map((item) => {
      return (
        <CarouselItem
          onExiting={this.onExiting}
          onExited={this.onExited}
          key={item.src}
        >
          <img src={item.src} alt={item.altText} />
          <CarouselCaption captionText={item.caption} captionHeader={item.header} />
        </CarouselItem>
      )
    })

    return (
      <Carousel
        activeIndex={activeIndex}
        next={this.next}
        previous={this.previous}
      >
        {slides}
        <CarouselControl direction="prev" directionText="Previous" onClickHandler={this.previous} />
        <CarouselControl direction="next" directionText="Next" onClickHandler={this.next} />
      </Carousel>
    )
  }
}

FirstTime.propTypes = {
  brain: PropTypes.instanceOf(Object).isRequired,
}
