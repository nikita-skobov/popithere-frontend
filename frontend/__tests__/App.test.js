/* global test, expect */
import React from 'react'
import renderer from 'react-test-renderer'
import App from '../src/App'

test('App works', () => {
  const component = renderer.create(
    <App name="myname2" />,
  )

  const tree = component.toJSON()
  expect(tree).toMatchSnapshot()
})
