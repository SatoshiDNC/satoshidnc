self.addEventListener('install', event => {
  console.log('Service worker installed')
})
self.addEventListener('activate', event => {
  console.log('Service worker activated')
})
self.addEventListener('sync', event => {
  console.log('sync', event.tag)
  // if (event.tag === 'sync-messages') {
  //   event.waitUntil(sendMessages())
  // }
})