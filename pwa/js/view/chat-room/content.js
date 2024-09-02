import { barTop } from './bar-top.js'
import { drawRoundedRect } from '../../draw.js'

export const contentView = v = new fg.View(null)
v.name = Object.keys({contentView}).pop()
v.bgColor = [0x09/0xff, 0x14/0xff, 0x1a/0xff, 1]
v.setContact = function(contact) {
  console.log(`contact: ${JSON.stringify(contact)}`)
  const v = this
  v.contact = contact
  barTop.contact = contact
  v.messages = []
  v.messages.push({
    type: 'date marker',
  })
  v.messages.push({
    type: 'security info',
    text: [
      'End-to-end encryption does not guarantee',
      'privacy when your device can be surveilled.',
  
      //'Encryption does not guarantee your privacy',
      //'E2E encrypted, without guarantee of privacy',
      //'when your device is subject to surveillence.',
      'Tap for offline encryption and signing info.',
    ],
  })
}
v.renderFunc = function() {
  const v = this
  gl.clearColor(...v.bgColor)
  gl.clear(gl.COLOR_BUFFER_BIT)
  const m = mat4.create()

  let s, text, w
  let y = 0
  for (m of v.messages) {
    s = 27/14
    y += 13
    switch (m.type) {
      case 'date marker':
        text = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        w = defaultFont.calcWidth(text) * s
        drawRoundedRect(v, colors.chatInfoBubble, 20, (v.sw-w-24*2)/2,y,w+24*2,78)
        mat4.identity(m)
        mat4.translate(m,m, [(v.sw-w)/2, y+53, 0])
        mat4.scale(m,m, [s, s, 1])
        defaultFont.draw(0,0, text, colors.chatInfoText, v.mat, m)
        y += 78
        break
      case 'security info':
        test = m.text
        w = text.map(line => defaultFont.calcWidth(line) * s)
        let maxw = w.reduce((p,q)=>Math.max(p,q),0)
        drawRoundedRect(v, colors.chatInfoBubble, 20, (v.sw-maxw-24*2)/2,y,maxw+24*2,165)
        for (let i = 0; i < 3; i++) {
          mat4.identity(m)
          mat4.translate(m,m, [(v.sw-w[i])/2, 52 + 44*i, 0])
          mat4.scale(m,m, [s, s, 1])
          defaultFont.draw(0,0, text[i], colors.chatInfoText2, v.mat, m)
        }
        y += 165
        break
    }
    y += 13
  }


}
