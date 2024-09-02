import { drawRoundedRect } from '../../../draw.js'

let v, g
export const menuView = v = new fg.View(null)
v.name = Object.keys({menuView}).pop()
v.designSize = 1080*2183
v.bgColor = [0x12/0xff, 0x1b/0xff, 0x22/0xff, 1]
v.textColor = [0xf7/0xff, 0xf8/0xff, 0xfa/0xff, 1]
v.easingState = 1
v.easingValue = 0
v.easingRate = 0.033
v.items = []
v.menuX = 0
v.menuR = 32
v.getText = (mime) => {
  return new Promise((resolve, reject) => {
    navigator.clipboard.read().then(items => {
      if (items.length == 1) {
        const item = items[0]
        if (item.types.includes(mime)) {
          item.getType(mime).then(blob => blob.text()).then(text => {
            resolve(text)
          })
        } else {
          reject(`To sign what is in the clipboard, the clipboard must contain ${mime}.`)
        }
      } else {
        reject(`To sign what is in the clipboard, the clipboard must contain only one item.`)
      }
    })  
  })
}
// v.items.map((item, i) => {
//   v.gadgets.push(g = new fg.Gadget(v))
//   g.actionFlags = fg.GAF_CLICKABLE
//   g.label = item
//   g.index = i
//   v.gadgets[`index${i}`] = g
//   g.clickFunc = function() {
//     const g = this, v = this.viewport
//     switch (g.index) {
//     case SIGN_TEXT:
//       // v.getText('text/plain').then(text => {
//       //   const signedText = signText(text, hpub()).toString('hex')
//       //   navigator.clipboard.write([new ClipboardItem({ 'text/plain': new Blob([signedText], { type: 'text/plain' }) })]).then(() => {
//       //     console.log(`signature: ${signedText}`)
//       //     menuRoot.easeOut()
//       //   })
//       // })
//       break
//     case SIGN_EVENT:
//       // v.getText('text/plain').then(text => {
//       //   let event = JSON.parse(text)
//       //   let signedEvent
//       //   try {
//       //     signedEvent = finalizeEvent(event, bsec())
//       //     //signedText = Buffer.from(schnorr.sign(Buffer.from(serializeEvent(event), 'hex'), bsec())).toString('hex')
//       //   } catch(e) {
//       //     console.warn(`Unable to sign; invalid event in clipboard.`)
//       //     return
//       //   }
//       //   const signedText = JSON.stringify(signedEvent)
//       //   navigator.clipboard.write([new ClipboardItem({ 'text/plain': new Blob([signedText], { type: 'text/plain' }) })]).then(() => {
//       //     console.log(`signed event: ${signedText}`)
//       //     menuRoot.easeOut()
//       //   })
//       // })
//       break
//     default:
//       console.log(g.label)
//       menuRoot.easeOut()
//     }
//   }
// })
v.gadgets.push(g = v.menuGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.clickFunc = function(e) {
    const g = this, v = this.viewport
    const x = e.x / v.viewScale - v.menuX, y = e.y / v.viewScale - v.menuY
    const index = Math.floor((y - 79 - 33 / 2 + 126 / 2) / 126)
    if (index >= 0 && index < v.items.length) {
      v.items[index].handler(v.items[index])
      menuRoot.easeOut()
    } else {
      // console.log('menu', x, y, index)
    }
  }
v.gadgets.push(g = v.screenGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.clickFunc = function() {
    menuRoot.easeOut()
  }
v.prepMenu = function(items) {
  const v = this
  v.items = items
  v.currentItemCount = items.length
}
v.layoutFunc = function() {
  const v = this
  v.menuH = 62 + 126 * v.currentItemCount
  v.menuY = v.sh - v.menuH
  v.menuW = v.sw
  let g
  let i = 0
  for (g of v.gadgets) if (g.enabled) {
    g.x = v.menuX + 45
    g.y = v.menuY + 79 + i * 126
    g.w = v.menuW - 45*2
    g.h = 33
    g.autoHull()
    i++
  }
  g = v.menuGad
  g.x = v.menuX
  g.y = v.menuY
  g.w = v.menuW
  g.h = v.menuH
  g.autoHull()
  g = v.screenGad
  g.x = 0
  g.y = 0
  g.w = v.sw
  g.h = v.sh
  g.autoHull()
}
v.renderFunc = function() {
  const v = this
  if (v.easingState) {
    if (v.easingState == 1) {
      v.easingValue += v.easingRate
      if (v.easingValue >= 1) {
        v.easingValue = 1
        v.easingState = 0
      }
    }
    if (v.easingState == -1) {
      v.easingValue -= v.easingRate
      if (v.easingValue < 0) {
        v.easingValue = 0
        v.easingState = 0
        menuRoot.out()
      }
    }
    menuRoot.ghostOpacity = v.easingValue * 0.5
    v.setRenderFlag(true)
  }
  const f1 = v.easingValue
  const f0 = 1 - f1
  const m = mat4.create()

  drawRoundedRect(v, v.bgColor, 75, v.menuX,v.menuY * f1 + v.sh * f0,v.menuW,v.menuH + 75)

  mat4.identity(m)
  mat4.translate(m,m, [v.menuX + 45, v.menuY + 203 + 41 + v.menuH * f0, 0])
  mat4.scale(m,m, [41/14, 41/14, 1])
  defaultFont.draw(0,0, 'Send messages in this chat as', v.textColor, v.mat, m)

  let i = 0
  for (const item of v.items) {
    mat4.identity(m)
    mat4.translate(m,m, [v.menuX + 45, v.menuY + 79 + i * 126 + 33, 0])
    mat4.scale(m,m, [33/14, 33/14, 1])
    const c = v.textColor
    defaultFont.draw(0,0, item.label, [c[0],c[1],c[2],v.easingValue], v.mat, m)
    i++
  }
}

export const menuShim = v = new fg.OverlayView(null)
v.name = Object.keys({menuShim}).pop()
v.a = menuView; menuView.parent = v
// v.b = chatRoot; chatRoot.parent = v

export const menuRoot = menuShim
menuRoot.ghostOpacity = 0
menuRoot.easeIn = function(items) {
  const v = this
  menuView.prepMenu(items)
  menuView.easingState = 1
  menuView.easingRate = 0.06
  const r = fg.getRoot()
  if (r !== v) {
    menuShim.b = r; r.parent = menuShim
    v.ghostView = r
    fg.setRoot(v)
  }
}
menuRoot.easeOut = function() {
  const v = this
  menuView.easingState = -1
  menuView.easingRate = 0.1
  v.setRenderFlag(true)
}
menuRoot.easingState = function() {
  return menuView.easingState
}
menuRoot.out = function() {
  fg.setRoot(menuRoot.ghostView)
}
