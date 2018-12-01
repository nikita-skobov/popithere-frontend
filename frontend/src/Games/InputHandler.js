export default class InputHandler {
  constructor(props) {
    this.inputLayer = props.inputLayer

    this.toggleInteractions = this.toggleInteractions.bind(this)
    this.getLocalPosition = this.getLocalPosition.bind(this)
    this.on = this.on.bind(this)
  }

  toggleInteractions(flag) {
    this.inputLayer.root.interactive = flag
  }

  getLocalPosition(event) {
    return event.data.getLocalPosition(this.inputLayer.root)
  }

  on(event, callback) {
    this.inputLayer.on(event, (e) => {
      callback(e)
    })
  }
}
