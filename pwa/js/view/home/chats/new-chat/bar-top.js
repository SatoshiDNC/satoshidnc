import { menuView as trezorTools } from '../tools-trezor.js'
import { hpubDecode, validKey } from '../../../../nostor-util.js'
import { contacts, addNewContact, reloadContacts } from '../../../../contacts.js'

let v, g
export const barTop = v = new fg.View()
v.name = Object.keys({barTop}).pop()
v.designHeight = 147
v.bgColor = [0.043,0.078,0.106,1]
v.textColor = [1,1,1,1]
v.gadgets.push(g = v.backGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.label = '\x08'
  g.x = 43, g.y = 52
  g.w = 42, g.h = 42
  g.font = iconFont
  g.fontSize = 13
  g.autoHull()
  g.clickFunc = function() {
    const g = this, v = this.viewport
    g.root.easeOut(g.target)
  }
v.gadgets.push(g = v.menuGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.label = ':'
  g.font = iconFont
  g.fontSize = 11
  g.handler = function(item) {
    console.log(`id ${JSON.stringify(item)}`)
  }
  g.batchPasteHandler = function(item) {
    navigator.clipboard.read().then(clipboardContents => {
      for (const item of clipboardContents) {
        if (!item.types.includes('text/plain')) {
          alert(`Clipboard does not contain plain text data.`)
        }
        item.getType('text/plain').then(blob => blob.text()).then(rawText => {
          let npubs = []
          let text = rawText.replaceAll('"',' ').replaceAll(',',' ').replaceAll('\n',' ').replaceAll('\r',' ').replaceAll('\t',' ')
          npubs = text.split(' ').map(a => a.trim())
          if (text.includes(' ')) {
          } else {
          }
          let n = 0, m = 0
          for (const npub of npubs) {
            let hpub = hpubDecode(npub)
            if (hpub) {
              if (contacts.filter(c => c.hpub == hpub).length == 0) {
                addNewContact(hpub)
                n++
              } else {
                m++
              }
            }
          }
          reloadContacts()
          if (n||m) {
            alert(icap(`${n?`imported ${n} new`:``}${n&&m?` and `:``}${m?`skipped ${m} existing`:``} public key${n+m==1?``:`s`}.`))
          } else {
            alert(`No public keys found in clipboard. Public keys should be delimited by whitespace, commas, or JSON.`)
          }
        })
      }
    }, reason => {
      alert(`error: ${reason}`)
    })
  }
  // g.importHandler = function(item) {
  // }
  // g.exportHandler = function(item) {
  // }
  g.items = [
    { id: 1, label: 'Batch paste public keys', handler: g.batchPasteHandler },
    // { id: 2, label: 'Import contacts...', handler: g.importHandler },
    // { id: 3, label: 'Export contacts...', handler: g.exportHandler },
    { id: 4, label: 'Trezor tools', handler: trezorTools.invoker },
  ]
  g.clickFunc = function() {
    const g = this, v = this.viewport
    if (fg.getRoot() !== g.target || g.target.easingState() == -1) {
      g.target?.easeIn?.(g.items)
    } else {
      g.target?.easeOut?.()
    }
  }
v.gadgets.push(g = v.searchGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.label = '?'
  g.font = iconFont
  g.fontSize = 11
  g.clickFunc = function() {
    const g = this, v = this.viewport
    console.log(`click '${g.label}'`)
  }
v.gadgets.push(g = v.lawGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.label = '='
  g.font = iconFont
  g.fontSize = 11
  g.clickFunc = function() {
    const g = this, v = this.viewport
    console.log(`click '${g.label}'`)
  }
v.layoutFunc = function() {
  const v = this
  g = v.menuGad
  g.x = v.sw - 64
  g.y = 51
  g.w = 12
  g.h = 45
  g.autoHull()
  g = v.searchGad
  g.x = v.sw - 192
  g.y = 51
  g.w = 45
  g.h = 45
  g.autoHull()
  g = v.lawGad
  g.x = v.sw - 322
  g.y = 51
  g.w = 45
  g.h = 45
  g.autoHull()
}
v.renderFunc = function() {
  const v = this
  gl.clearColor(...v.bgColor)
  gl.clear(gl.COLOR_BUFFER_BIT)
  const m = mat4.create()

  mat4.identity(m)
  mat4.translate(m, m, [138, 68, 0])
  mat4.scale(m, m, [33/14, 33/14, 1])
  defaultFont.draw(0,0, 'Select contact', v.textColor, v.mat, m)

  mat4.identity(m)
  mat4.translate(m, m, [138, 118, 0])
  mat4.scale(m, m, [25/14, 25/14, 1])
  const n = contacts.length
  defaultFont.draw(0,0, `${n} contact${n==1?'':'s'}`, v.textColor, v.mat, m)

  for (g of v.gadgets) {
    mat4.identity(m)
    mat4.translate(m, m, [g.x, g.y+g.h, 0])
    mat4.scale(m, m, [g.h/g.fontSize, g.h/g.fontSize, 1])
    g.font.draw(0,0, g.label, v.textColor, v.mat, m)
  }
}

