import React, { Component } from 'react'
import PropTypes from 'prop-types'

export default class App extends Component {
  constructor(props) {
    super(props)
    this.name = props.name
  }

  render() {
    return (
      <div className="App">
        <h2>hello {this.name}</h2>
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
