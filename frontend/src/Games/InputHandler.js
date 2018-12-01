export default class InputHandler {
  constructor(props) {
    this.inputLayer = props.inputLayer
  }

  toggleInteractions(flag) {
    this.inputLayer.root.interactive = flag
  }

  getLocalPosition(event) {
    return event.data.getLocalPosition(this.inputLayer.root)
  }
}
