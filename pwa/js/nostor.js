export function bech32_noteId(bech32) {
  console.log('here')
  try {
    const decoded = nip19.decode(bech32)
    console.log('decoded:', JSON.stringify(decoded))
    if (decoded?.type == 'note') {
      return decoded.data.id
    }
  } catch(e) {
  }
}
