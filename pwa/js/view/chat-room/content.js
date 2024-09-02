import { barTop } from './bar-top.js'
import { setEasingParameters } from '../util.js'

export const contentView = v = new fg.View(null)
v.name = Object.keys({contentView}).pop()
v.designSize = 640*400
v.splashMode = 0
v.frameTimes = []
v.bgColor = [0x09/0xff, 0x14/0xff, 0x1a/0xff, 1]
v.setContact = function(contact) {
  console.log(`contact: ${JSON.stringify(contact)}`)
  const v = this
  v.contact = contact
  barTop.contact = contact
}
v.renderFunc = function() {
  const v = this
  gl.clearColor(...v.bgColor)
  gl.clear(gl.COLOR_BUFFER_BIT)
  const mat = mat4.create()

}
