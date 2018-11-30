export default class Game {
  constructor(props) {
    console.log('inside game cosntructor')
    console.log(props)
    this.baseLayer = props.baseLayer
    this.inputLayer = props.inputLayer
  }
}
