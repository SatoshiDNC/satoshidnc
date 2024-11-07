let context

export function sfx(name, fg) {
  if (!context) {
    context = new AudioContext()

    // var osc1 = context.createOscillator(), osc2 = context.createOscillator()
    // osc1.type = 'triangle', osc1.frequency.value = 493.883 + 1
    // osc2.type = 'triangle', osc2.frequency.value = 493.883 - 2

    var volume = context.createGain()
    volume.gain.value = fg? 0.1 : 1.0

    // osc1.connect(volume)
    // osc2.connect(volume)

    const source = context.createBufferSource();
    fetch(`/sfx/soft-notification-1.mp3`).then(res => res.arrayBuffer()).then(arrayBuffer => context.decodeAudioData(arrayBuffer)).then(buffer => {
      source.buffer = buffer
      source.connect(volume)
    })

    volume.connect(context.destination)
  }
  source.start()
  // var duration = 1
  // var startTime = context.currentTime
  // volume.gain.setValueAtTime(0.1, startTime + 0.5)
  // volume.gain.linearRampToValueAtTime(0, startTime + duration)
  // osc1.start(startTime)
  // osc2.start(startTime)
  // osc1.stop(startTime + duration)
  // osc1.stop(startTime + duration)
}

