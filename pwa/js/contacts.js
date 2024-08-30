import * as nip19 from 'nostr-tools/nip19'

export const contacts = []

export function newContact(name, npub) {
  return {
    name: name,
    pubkey: nip19.npubDecode(npub),
    xmitDate: new Date(),
    xmitText: 'You reacted "&" to "Ok, thanks for the help!"',
  }
}
