export const contacts = []

export function newContact(name, npub) {
  return {
    name: name,
    pubkey: npub,
    xmitDate: new Date(),
    xmitText: 'You reacted "&" to "Ok, thanks for the help!"',
  }
}
