let context

export function sfx(name, fg) {
  if (!context) {
    context = new AudioContext()
    var osc1 = context.createOscillator(), osc2 = context.createOscillator()
    osc1.type = 'triangle', osc1.frequency = 493.883 + 1
    osc2.type = 'triangle', osc2.frequency = 493.883 - 2
    var volume = context.createGain()
    volume.gain.value = fg? 0.1 : 1.0
    osc1.connect(volume)
    osc2.connect(volume)
    volume.connect(context.destination)
  }
  var duration = 2
  var startTime = context.currentTime
  volume.gain.setValueAtTime(0.1, startTime + duration - 0.05)
  volume.gain.linearRampToValueAtTime(0, startTime + duration)
  osc1.start(startTime)
  osc2.start(startTime)
  osc1.stop(startTime + duration)
  osc1.stop(startTime + duration)
}

