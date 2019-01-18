/* global document */
/*
Shamelessly stolen from:
https://stackoverflow.com/questions/3368837/list-every-font-a-users-browser-can-display/3368855#3368855
*/

export default function Detector() {
  // a font will be compared against all the three default fonts.
  // and if it doesn't match all 3 then that font is not available.
  const baseFonts = ['monospace', 'sans-serif', 'serif']

  // we use m or w because these two characters take up the maximum width.
  // And we use a LLi so that the same matching fonts can get separated
  const testString = 'mmmmmmmmmmlli'

  // we test using 72px font size, we may use any size. I guess larger the better.
  const testSize = '72px'

  const h = document.getElementsByTagName('body')[0]

  // create a SPAN in the document to get the width of the text we use to test
  const s = document.createElement('span')
  s.style.fontSize = testSize
  s.innerHTML = testString
  const defaultWidth = {}
  const defaultHeight = {}
  baseFonts.forEach((val) => {
    // get the default width for the three base fonts
    s.style.fontFamily = val
    h.appendChild(s)
    defaultWidth[val] = s.offsetWidth // width for the default font
    defaultHeight[val] = s.offsetHeight // height for the defualt font
    h.removeChild(s)
  })

  function detect(font) {
    let detected = false
    baseFonts.forEach((val) => {
      s.style.fontFamily = `${font},${val}` // name of the font along with the base font for fallback.
      h.appendChild(s)
      const matched = (s.offsetWidth !== defaultWidth[val] || s.offsetHeight !== defaultHeight[val])
      h.removeChild(s)
      detected = detected || matched
    })
    return detected
  }

  this.detect = detect
}
