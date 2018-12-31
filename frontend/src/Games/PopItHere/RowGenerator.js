import React from 'react'

import { Row, Col, Button } from 'reactstrap'

import PropTypes from 'prop-types'

const RowGenerator = (props) => {
  const {
    cellCount,
    loopArray,
    offset,
    cb,
    isSearching,
  } = props

  const cellList = [...Array(cellCount).keys()]

  if (loopArray.length === 0) {
    return (
      <Row>
        <Col>
          <p>
            No results found. {isSearching && 'Sometimes it might take a while for a popit to show up.'}
          </p>
        </Col>
      </Row>
    )
  }

  return cellList.map((index) => {
    if (index % 2 === 0) {
      if (loopArray[index + offset]) {
        // if the loopArray has an item at this index
        const item1 = loopArray[index + offset]
        if (loopArray[index + offset + 1]) {
          // if both 0,1 exist then render both side by side
          const item2 = loopArray[index + 1 + offset]
          return (
            <Row className="mb1em">
              <Col>
                <Button onClick={cb} name={item1.name} className="half-trans">
                  <img name={item1.name} className="w50" src={item1.url} alt="some shit" />
                </Button>
              </Col>
              <Col>
                <Button onClick={cb} name={item2.name} className="half-trans">
                  <img name={item2.name} className="w50" src={item2.url} alt="some shit" />
                </Button>
              </Col>
            </Row>
          )
        }
        // if reaching the end of the list, odd number
        // of images, then render 1, but empty second
        return (
          <Row className="mb1em">
            <Col>
              <Button onClick={cb} name={item1.name} className="half-trans">
                <img name={item1.name} className="w50" src={item1.url} alt="some shit" />
              </Button>
            </Col>
            <Col />
          </Row>
        )
      }
      // otherwise, reached the end of assets, so just render
      // empty columns
      return (
        <Row className="mb1em">
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
  cb: PropTypes.func.isRequired,
  isSearching: PropTypes.bool.isRequired,
}

export default RowGenerator
