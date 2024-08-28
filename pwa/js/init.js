import { barTop as homeChatTop } from './view/home-chat/bar-top.js'
import { barTop as newChatTop } from './view/new-chat/bar-top.js'
import { barTop as chatRoomBar } from './view/chat-room/bar-top.js'
import { menuRoot } from './menu.js'
import { chatRoot } from './view/chat-room/content.js'
import { homeRoot } from './view/home-chat/root.js'
import { homeOverlayView } from './view/home-chat/content.js'
import { newChatRoot } from './view/new-chat/content.js'

homeChatTop.menuGad.target = menuRoot
newChatTop.backGad.root = newChatRoot, newChatTop.backGad.target = homeRoot
chatRoomBar.backGad.root = chatRoot, chatRoomBar.backGad.target = homeRoot
chatRoomBar.menuGad.target = menuRoot
homeOverlayView.addGad.root = homeRoot, homeOverlayView.addGad.target = newChatRoot
