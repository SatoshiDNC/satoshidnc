import * as nip19 from 'nostr-tools/nip19'

export const contacts = []

export function newContact(name, npub) {
  console.log(name, npub)
  console.log(nip19.decode(npub))
  return {
    name: name,
    pubkey: nip19.decode(npub).data,
    xmitDate: new Date(),
    xmitText: 'You reacted "&" to "Ok, thanks for the help!"',
  }
}
