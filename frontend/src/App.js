import React, { Component } from 'react'
import PropTypes from 'prop-types'

const tester = () => {
  const test = 'yupp'
  return {
    hello: 'wolrd',
    suze: 'yes',
    bob: 100,
    test,
  }
}

class App extends Component {
  constructor(props) {
    super(props)
    this.name = props.name
  }

  render() {
    const {
      hello,
      suze,
      bob,
      test,
    } = tester()

    return (
      <div className="App">
        <h2>hello {this.name}</h2>
        <h3>hello {hello}</h3>
        <h4>hello {suze}</h4>
        <h5>hello {bob}</h5>
        <h6>hello {test}</h6>
      </div>
    )
  }
}

App.defaultProps = {
  name: null,
}

App.propTypes = {
  name: PropTypes.string,
}

export default App
