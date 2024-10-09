self.addEventListener('install', event => {
  console.log('Service worker installed')
})
self.addEventListener('activate', event => {
  console.log('Service worker activated')
})
const MINUTE = 60 * 1000
let minutely
self.addEventListener('sync', event => {
  console.log('sync', event.tag)
  let now = Date.now()
  switch (event.tag) {
    case 'minutely':
      if (!minutely || now - minutely < MINUTE) break
      minutely = now
      minutelyTasks()
      break
  }
})
self.addEventListener('periodicsync', event => {
  console.log('periodicsync', event.tag)
  // if (event.tag === 'sync-messages') {
  //   event.waitUntil(sendMessages())
  // }
})
function minutelyTasks() {
  console.log('run minutely')
}