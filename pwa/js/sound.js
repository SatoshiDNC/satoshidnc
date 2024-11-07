let context, volume
export function sfx(name, fg) {
  if (!context) {
    context = new AudioContext()
  }
  fetch(`/sfx/soft-notification-1.mp3`).then(res => res.arrayBuffer()).then(arrayBuffer => context.decodeAudioData(arrayBuffer)).then(buffer => {
    const source = context.createBufferSource()
    source.buffer = buffer
    source.connect(context.destination)
    source.start()
  })
}

