export function init() {
  return new Promise((resolve, reject) => {
    const req = window.indexedDB.open('db', 1)
    req.onsuccess = e => {
      db = req.result
      resolve()
    }
    req.onerror = e => {
      reject(e)
    }
    req.onupgradeneeded = e => {
      console.log(`db: upgrading from ${e.oldVersion} to ${e.newVersion}`)
      let os
      if (e.oldVersion < 1) {
        const keys = os = db.createObjectStore(`keys`, { keyPath: 'hpub' })
      }
    }
  })
}