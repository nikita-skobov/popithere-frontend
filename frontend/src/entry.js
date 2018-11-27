/* global document */
import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import 'bootstrap/dist/css/bootstrap.min.css'

const reactContainer = document.getElementById('react-container')

ReactDOM.render(<App name="mynamehere" />, reactContainer)
