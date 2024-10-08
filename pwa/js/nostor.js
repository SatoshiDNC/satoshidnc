import * as nip19 from 'nostr-tools/nip19'

export function bech32_noteId(bech32) {
  try {
    const decoded = nip19.decode(bech32)
    if (decoded?.type == 'note') {
      return decoded.data
    }
  } catch(e) {
  }
}
