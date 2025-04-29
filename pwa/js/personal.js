import { db } from './db.js'
import { hue, color_from_rgb_integer } from './draw.js'

const TAG = `personal-data`

export const personalData = []
export const personalDataTrigger = []

export function getName(hpub) {
  return getPersonalData(hpub, 'name') || 'Unnamed'
}

export function getHue(hpub) {
  return hue(getColor(hpub))
}
export function getColor(hpub) {
  return getPersonalData(hpub, 'color') || color_from_rgb_integer(parseInt(hpub[61]+hpub[61]+hpub[62]+hpub[62]+hpub[63]+hpub[63],16))
}

export function getPersonalData(hpub, key) {
  return personalData.filter(pd => pd.hpub == hpub && pd.key == key)?.[0]?.value
}

export function setPersonalData(hpub, key, value) {
  const tr = db.transaction('personal', 'readwrite', { durability: 'strict' })
  const os = tr.objectStore('personal')
  const req = os.put({ hpub, key, value })
  req.onsuccess = (e) => {
    console.log(`[${TAG}] updated`)
    reloadPersonalData()
  }
}

export function reloadPersonalData() {
  const tr = db.transaction('personal', 'readonly')
  const os = tr.objectStore('personal')
  const req = os.openCursor()
  req.onerror = function(e) {
     console.error(e)
  }
  const newList = []
  req.onsuccess = function(e) {
    let cursor = e.target.result
    if (cursor) {
      let v = cursor.value
      newList.push({ hpub: v.hpub, key: v.key, value: v.value })
      cursor.continue()
    } else {
      personalData.length = 0
      personalData.push(...newList)
      console.log(`[${TAG}] triggering dependencies`)
      setTimeout(() => { personalDataTrigger.map(f => f()) })
    }
  }
}
