export function nostrWatchRelays() {
  return new Promise((resolve, reject) => {
    fetch(`https://api.nostr.watch/v1/online`).then(resp => resp.json()).then(json => {
      resolve(json)
    }, rejectReason => {
      console.log(rejectReason)
      resolve([])
    })
  })
}