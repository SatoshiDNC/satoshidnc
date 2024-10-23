import { overlayView } from './overlay.js'
import { contentView } from './content.js'
import { setEasingParameters } from '../../../util.js'

export const rootView = v = new fg.OverlayView(null)
v.name = Object.keys({rootView}).pop()
v.designSize = 1080 * 2183
v.ghostOpacity = 0
v.bgColor = [0,0,0,1]
v.a = overlayView; overlayView.parent = v
v.b = contentView; contentView.parent = v
v.setContext = function(updates) {
  console.log('setContext:', updates)
  contentView.setContext(updates)
  overlayView.setContext(updates)
  // let startAt
  // for (const update of updates) {
  //   if (!update.viewed) {
  //     startAt = update
  //   }
  // }
  // if (startAt) {
  // }

}
setEasingParameters(v)
