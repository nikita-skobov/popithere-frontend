import React from 'react'

import { Row, Col } from 'reactstrap'

import PropTypes from 'prop-types'

const RowGenerator = (props) => {
  const {
    cellCount,
    loopArray,
    offset,
  } = props

  const cellList = [...Array(cellCount).keys()]
  return cellList.map((index) => {
    if (index % 2 === 0) {
      if (loopArray[index + offset]) {
        // if the loopArray has an item at this index
        const item1 = loopArray[index + offset]
        if (loopArray[index + 1]) {
          // if both 0,1 exist then render both side by side
          const item2 = loopArray[index + 1 + offset]
          return (
            <Row>
              <Col>{item1.name}</Col>
              <Col>{item2.name}</Col>
            </Row>
          )
        }
        // if reaching the end of the list, odd number
        // of images, then render 1, but empty second
        return (
          <Row>
            <Col>{item1.name}</Col>
            <Col />
          </Row>
        )
      }
      // otherwise, reached the end of assets, so just render
      // empty columns
      return (
        <Row>
          <Col />
          <Col />
        </Row>
      )
    }
    return null
  })
}

RowGenerator.defaultProps = {
  offset: 0,
}

RowGenerator.propTypes = {
  cellCount: PropTypes.number.isRequired,
  loopArray: PropTypes.instanceOf(Array).isRequired,
  offset: PropTypes.number,
}

export default RowGenerator
