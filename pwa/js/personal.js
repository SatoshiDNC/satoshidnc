import { db } from './db.js'

export const personalDataDependencies = []

export const personalData = []

export function setPersonalData(hpub, key, value) {
  const tr = db.transaction('personal', 'readwrite', { durability: 'strict' })
  const os = tr.objectStore('personal')
  const req = os.put({ hpub, key, value })
  req.onsuccess = (e) => {
    reloadPersonalData()
  }
}

export function getPersonalData(hpub, key) {
  return personalData.filter(pd => pd.hpub == hpub && pd.key == key)?.[0]?.value
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
      personalDataDependencies.map(f => f())
    }
  }
}
