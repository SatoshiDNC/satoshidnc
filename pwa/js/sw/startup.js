const TAG = 'START'
export function startupTasks() {
  console.log(`[${TAG}] getting relay list`)
  nostrWatchRelays().then(onlineRelays => {
    console.log(JSON.stringify(onlineRelays))
  }, error => {
    console.log(`[${TAG}] couldn't get relay list: ${error}`)
  })
}
