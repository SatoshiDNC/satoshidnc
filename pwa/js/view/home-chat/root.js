import { barTop } from './bar-top.js'
import { barBot } from './bar-bot.js'
import { homeView, homeOverlayView } from './content.js'
import { setEasingParameters } from '../util.js'

export const homeOverlay = v = new fg.OverlayView(null)
v.name = Object.keys({homeOverlay}).pop()
v.ghostOpacity = 0
v.a = homeOverlayView; homeOverlayView.parent = v
v.b = homeView; homeView.parent = v

export const homeSend = v = new fg.SliceView(null, 'br', .125)
v.name = Object.keys({homeSend}).pop()
v.prop = true
v.a = barBot; barBot.parent = v
v.b = homeOverlay; homeOverlay.parent = v

export const homeRoom = v = new fg.SliceView(null, 'tl', .125)
v.name = Object.keys({homeRoom}).pop()
v.prop = true
v.a = barTop; barTop.parent = v
v.b = homeSend; homeSend.parent = v

export const homeRoot = homeRoom
v = homeRoot
v.bgColor = [0,0,0,1]
setEasingParameters(homeRoot)
