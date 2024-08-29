import { barTop as homeChatTop } from './view/home-chat/bar-top.js'
import { barTop as newChatTop } from './view/home-chat/new-chat/bar-top.js'
import { barTop as chatRoomBar } from './view/chat-room/bar-top.js'
import { menuRoot } from './menu.js'
import { chatRoot } from './view/chat-room/content.js'
import { homeRoot as homeChat_root } from './view/home-chat/root.js'
import { overlayView as homeChat_overlay } from './view/home-chat/content.js'
import { newChatRoot as homeChat_newChat_root } from './view/home-chat/new-chat/root.js'
import { contentView as homeChat_newChat_content} from './view/home-chat/new-chat/content.js'
import { newContactRoot as homeChat_newChat_newContact_root } from './view/home-chat/new-chat/new-contact/root.js'

homeChatTop.menuGad.target = menuRoot
newChatTop.backGad.root = homeChat_newChat_root, newChatTop.backGad.target = homeChat_root
chatRoomBar.backGad.root = chatRoot, chatRoomBar.backGad.target = homeChat_root
chatRoomBar.menuGad.target = menuRoot
homeChat_overlay.addGad.root = homeChat_root, homeChat_overlay.addGad.target = homeChat_newChat_root
homeChat_newChat_content.newContactGad.root = homeChat_newChat_root, homeChat_newChat_content.newContactGad.target = homeChat_newChat_newContact_root
