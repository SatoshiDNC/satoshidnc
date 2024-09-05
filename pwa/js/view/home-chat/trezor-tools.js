import { drawRect, drawPill, drawRoundedRect } from '../../draw.js'
import { trezorConnect, trezorPing, trezorRestore, trezorGetNostrPubKey, trezorSign, trezorWipe } from '../../trezor.js'
import { contentView as newContactForm } from './new-chat/new-contact/content.js'
import bjs from 'bitcoinjs-lib'
import bm from 'bitcoinjs-message'
import * as ecc from '@bitcoinerlab/secp256k1'
import * as bip32f from 'bip32'
import { Buffer } from 'buffer'

const TITLE_TOP = 120
const ITEM_TOP = TITLE_TOP + 61
const ITEM_SIZE = 179
const BOT_SPACE = 203

const ENTER_SEED = 'ENTER_SEED'
const GEN_HPUB = 'GEN_HPUB'
const SIGN_MSG = 'SIGN_MSG'
const WIPE_SEED = 'WIPE_SEED'

let v, g
export const menuView = v = new fg.View(null)
v.name = Object.keys({menuView}).pop()
v.designSize = 1080*2183
v.bgColor = [0x12/0xff, 0x1b/0xff, 0x22/0xff, 1]
v.textColor = [0xf7/0xff, 0xf8/0xff, 0xfa/0xff, 1]
v.invoker = function(item, parentRoot) {
  const v = this
  const openTrezorPanel = () => {
    if (fg.getRoot() !== menuRoot || menuRoot.easingState() == -1) {
      menuRoot.easeIn?.()
    } else {
      menuRoot.easeOut?.()
    }
  }
  trezorConnect().then(() => {
    if (fg.getRoot() === parentRoot) {
      parentRoot.followUp = openTrezorPanel
    } else {
      openTrezorPanel()
    }
  }).catch(e => {
    console.warn(e)
  })
}
v.easingState = 1
v.easingValue = 0
v.easingRate = 0.033
v.items = [
  { key: ENTER_SEED, name: 'Enter seed words on Trezor'},
  { key: GEN_HPUB,   name: 'Generate nostr public key'},
  { key: SIGN_MSG,   name: 'Sign message'},
  { key: WIPE_SEED,  name: 'Wipe seed from Trezor'},
]
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
v.gadgets.push(g = v.closeGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.x = 69, g.h = 104
  g.clickFunc = function(e) {
    const g = this, v = this.viewport
    menuRoot.easeOut()
  }
v.gadgets.push(g = v.menuGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.clickFunc = function(e) {
    const g = this, v = this.viewport
    const x = e.x / v.viewScale - v.menuX, y = e.y / v.viewScale - v.menuY
    const index = Math.floor((y - ITEM_TOP - 79 - 35 / 2 + ITEM_SIZE / 2) / ITEM_SIZE)
    if (index >= 0 && index < v.items.length) {
      v.index = index
      const clearSelection = () => {
        if (v.index == index) {
          v.index = -1
          v.setRenderFlag(true)
        }
      }
      const handleResult = result => {
        console.log('menu handleResult', result)
        clearSelection()
        if (result.message != 'Cancelled') {
          alert(result.message || result.xpub || result.address)
        }
      }
      const handleError = e => {
        alert(e)
        clearSelection()
      }
      switch (v.items[v.index].key) {
        case ENTER_SEED: v.busy = true; trezorRestore().then(handleResult).catch(handleError); break
        case GEN_HPUB:
          let a, n = -1
          while (!(n >= 0 && n < 2 ** 31)) {
            a = prompt("Account number (0 and up):")
            if (a === null) break
            n = +a
          }
          if (a === null) {
            clearSelection()
            break
          }
          v.busy = true
          trezorGetNostrPubKey(n).then(r => {
            console.log('// DERIVE A KEY FROM XPUB')
            console.log(r.nodeType.publicKey)
            const bip32 = bip32f.BIP32Factory(ecc)
            const xpubraw = bip32.fromBase58(r.xpub)
            console.log(xpubraw)
            console.log(xpubraw.publicKey)
            const { address } = bjs.payments.p2pkh({
              pubkey: bip32.fromBase58(r.xpub).publicKey,
            })
            console.log(address)
            clearSelection()
            menuRoot.followUp = () => {
              newContactForm.nameGad.text = ''
              newContactForm.pubkeyGad.text = r.nodeType.publicKey.slice(1).map(e => (e<15?'0':'')+e.toString(16)).join('')
              fg.getRoot().easeOut(g.newContactRoot)
            }
            menuRoot.easeOut()
          }).catch(handleError); break
        case SIGN_MSG: v.busy = true; trezorSign(0, 'test').then(r => {
          console.log(r)
          console.log(bm.verify('test', r.address, Buffer.from(r.sig)))
          clearSelection()
        }).catch(handleError); break
        case WIPE_SEED: v.busy = true; trezorWipe().then(handleResult).catch(handleError); break
      }
      // v.items[index].handler(v.items[index])
      // menuRoot.easeOut()
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
  v.items = items||v.items
  v.index = -1
  v.currentItemCount = v.items.length
}
v.layoutFunc = function() {
  const v = this
  v.menuH = ITEM_TOP + ITEM_SIZE * v.currentItemCount + BOT_SPACE
  v.menuY = v.sh - v.menuH
  v.menuW = v.sw
  let g
  g = v.closeGad
  g.y = v.sh - 147
  g.w = v.sw - 2 * g.x
  g.autoHull()
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
        if (menuRoot.followUp) {
          setTimeout(menuRoot.followUp)
          menuRoot.followUp = undefined
        }
      }
    }
    menuRoot.ghostOpacity = v.easingValue * 0.5
    v.setRenderFlag(true)
  }
  const f1 = v.easingValue
  const f0 = 1 - f1
  const m = mat4.create()
  const mat = mat4.create()

  drawRoundedRect(v, v.bgColor, 75, v.menuX, v.menuY + v.menuH * f0, v.menuW, v.menuH + 75)
  drawPill(v, colors.inactive, v.menuX + (v.menuW - 84) / 2, v.menuY + 26 + v.menuH * f0, 84, 11)

  mat4.identity(m)
  let str = 'Trezor tools'
  let s = 41/14
  mat4.translate(m,m, [v.menuX + (v.menuW - defaultFont.calcWidth(str) * s) / 2, v.menuY + TITLE_TOP + 41 + v.menuH * f0, 0])
  mat4.scale(m,m, [s, s, 1])
  defaultFont.draw(0,0, str, v.textColor, v.mat, m)

  let i = 0
  for (const item of v.items) {
    if (item.name == v.items?.[v.index]?.name) {
      drawRect(v, colors.inactiveDark, v.menuX, v.menuY + ITEM_TOP + 79 + 35 / 2 - ITEM_SIZE / 2 + ITEM_SIZE * i + v.menuH * f0, v.menuW, ITEM_SIZE)
    }
    if (v.busy) {
      mat4.identity(m)
      mat4.translate(m,m, [v.menuX + v.menuW - 190, v.menuY + ITEM_TOP + 79 + i * ITEM_SIZE + 35 + v.menuH * f0, 0])
      mat4.scale(m,m, [35/14, 35/14, 1])
      iconFont.draw(0,0, 'T', v.flash? v.textColor: colors.inactiveDark, v.mat, m)
      v.flash = !v.flash
      setTimeout(() => { v.setRenderFlag(true) }, 500)
    }
    mat4.identity(m)
    mat4.translate(m,m, [v.menuX + 190, v.menuY + ITEM_TOP + 79 + i * ITEM_SIZE + 35 + v.menuH * f0, 0])
    mat4.scale(m,m, [35/14, 35/14, 1])
    defaultFont.draw(0,0, item.name, v.textColor, v.mat, m)
    i++
  }

  let g = v.closeGad
  drawPill(v, colors.accent, g.x, g.y + v.menuH * f0, g.w, g.h)
  mat4.identity(m)
  str = 'Close'
  s = 29/14
  mat4.translate(m,m, [g.x + (g.w - defaultFont.calcWidth(str) * s) / 2, g.y + 66 + v.menuH * f0, 0])
  mat4.scale(m,m, [s, s, 1])
  defaultFont.draw(0,0, str, v.bgColor, v.mat, m)
}

export const menuRoot = v = new fg.OverlayView(null)
v.name = Object.keys({menuRoot}).pop()
v.a = menuView; menuView.parent = v
v.ghostOpacity = 0
v.easeIn = function(items) {
  const v = this
  menuView.prepMenu(items)
  menuView.easingState = 1
  menuView.easingRate = 0.06
  const r = fg.getRoot()
  if (r !== v) {
    v.b = r; r.parent = v
    v.ghostView = r
    fg.setRoot(v)
  }
}
v.easeOut = function() {
  const v = this
  menuView.easingState = -1
  menuView.easingRate = 0.1
  v.setRenderFlag(true)
}
v.easingState = function() {
  return menuView.easingState
}
v.out = function() {
  const v = this
  fg.setRoot(v.ghostView)
}
