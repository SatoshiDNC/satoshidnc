export const storageSystems = []

storageSystems.push({
  auth: 'nip-98',
  url: 'https://nostrcheck.me/api/v2/media',
  method: 'POST',
})

export function encrypt(readableStream) {
  return new Promise((resolve, reject) => {
    resolve(readableStream)
  })
}