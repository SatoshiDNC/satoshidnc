import { barTop } from './bar-top.js'
import { barBot } from '../bar-bot.js'
import { contentView } from './content.js'
import { overlayView } from './overlay.js'
import { setEasingParameters } from '../../util.js'

export const homeOverlay = v = new fg.OverlayView(null)
v.name = Object.keys({homeOverlay}).pop()
v.ghostOpacity = 0
v.a = overlayView; overlayView.parent = v
v.b = contentView; contentView.parent = v

export const homeRoot = v = new fg.DualSliceView(null, 'v', 147, 211)
v.name = Object.keys({homeRoot}).pop()
v.designSize = 1080 * 2183
v.bgColor = [0,0,0,1]
v.a = barTop; barTop.parent = v
v.b = homeOverlay; homeOverlay.parent = v
// v.c = barBot; barBot.parent = v
setEasingParameters(v)
