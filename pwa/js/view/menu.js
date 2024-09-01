import { chatRoot } from './chat-room/content.js'
import { schnorr } from '@noble/curves/secp256k1'
// import { hpub, signText } from './keys.js'
import { Buffer } from 'buffer'
import { serializeEvent } from 'nostr-tools'
import { finalizeEvent } from 'nostr-tools/pure'

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
// const SIGN_TEXT = 0; v.items[SIGN_TEXT] = 'Sign Text'
// const SIGN_EVENT = 1; v.items[SIGN_EVENT] = 'Sign Event'
v.menuX = 482
v.menuY = 137
v.menuW = 588
v.menuH = 62 + 126 * v.currentItemCount
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
    console.log('menu')
    console.log(e)
  }
v.gadgets.push(g = v.screenGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.clickFunc = function() {
    menuRoot.easeOut()
  }
v.prepMenu = function(items) {
  const v = this
  v.items = items
  return new Promise((resolve, reject) => {
    // v.gadgets[`index${SIGN_TEXT}`].enabled = false
    // v.gadgets[`index${SIGN_EVENT}`].enabled = false
    // v.getText('text/plain').then(text => {
    //   v.gadgets[`index${SIGN_TEXT}`].enabled = true
    //   let event
    //   try {
    //     event = JSON.parse(text)
    //   } catch(e) {
    //   }
    //   v.gadgets[`index${SIGN_EVENT}`].enabled = !!event
    //   finish()
    // }).catch(e => {
    //   finish()
    // })
    const finish = () => {
      // let count = 0
      // for (g of v.gadgets) if (g.label && g.enabled) {
      //   count++
      // }
      v.currentItemCount = items.length
      resolve()
    }
    finish()
  })
}
v.layoutFunc = function() {
  const v = this
  v.menuX = v.sw - v.menuW - 10
  v.menuH = 62 + 126 * v.currentItemCount
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
  const m = mat4.create()

  mainShapes.useProg2()
  gl.uniform4fv(gl.getUniformLocation(prog2, 'overallColor'), new Float32Array(v.bgColor))
  gl.uniformMatrix4fv(gl.getUniformLocation(prog2, 'uProjectionMatrix'), false, v.mat)
  mat4.identity(m)
  mat4.translate(m,m, [v.menuX, v.menuY, 0])
  mat4.scale(m,m, [v.menuW, v.menuH * v.easingValue, 1])
  gl.uniformMatrix4fv(gl.getUniformLocation(prog2, 'uModelViewMatrix'), false, m)
  mainShapes.drawArrays2('rect')

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
v.b = chatRoot; chatRoot.parent = v

export const menuRoot = menuShim
menuRoot.ghostOpacity = 0
menuRoot.easeIn = function(items) {
  const v = this
  menuView.prepMenu(items).then(() => {
    menuView.easingState = 1
    menuView.easingRate = 0.06
    const r = fg.getRoot()
    if (r !== v) {
      menuShim.b = r; r.parent = menuShim
      v.ghostView = r
      fg.setRoot(v)
    }
  })
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
