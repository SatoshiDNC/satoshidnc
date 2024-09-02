import { barTop as homeChatTop } from './view/home-chat/bar-top.js'
import { barTop as newChatTop } from './view/home-chat/new-chat/bar-top.js'
import { barTop as chatRoomBar } from './view/chat-room/bar-top.js'
import { menuRoot } from './view/menu.js'
import { chatRoomRoot as chatRoom_root } from './view/chat-room/root.js'
import { homeRoot as homeChat_root } from './view/home-chat/root.js'
import { contentView as homeChat_content, overlayView as homeChat_overlay } from './view/home-chat/content.js'
import { newChatRoot as homeChat_newChat_root } from './view/home-chat/new-chat/root.js'
import { contentView as homeChat_newChat_content} from './view/home-chat/new-chat/content.js'
import { barTop as homeChat_newChat_newContact_top } from './view/home-chat/new-chat/new-contact/bar-top.js'
import { newContactRoot as homeChat_newChat_newContact_root } from './view/home-chat/new-chat/new-contact/root.js'
import { barBot as homeChat_newChat_newContact_bot } from './view/home-chat/new-chat/new-contact/bar-bot.js'
import { contentView as homeChat_newChat_newContact_content } from './view/home-chat/new-chat/new-contact/content.js'
import { barBot as chatRoom_bot } from './view/chat-room/bar-bot.js'

homeChatTop.menuGad.target = menuRoot
newChatTop.backGad.root = homeChat_newChat_root, newChatTop.backGad.target = homeChat_root
chatRoomBar.backGad.root = chatRoom_root, chatRoomBar.backGad.target = homeChat_root
chatRoomBar.menuGad.target = menuRoot
homeChat_content.listGad.root = homeChat_root, homeChat_content.listGad.target = chatRoom_root
homeChat_overlay.addGad.root = homeChat_root, homeChat_overlay.addGad.target = homeChat_newChat_root
homeChat_newChat_content.newContactGad.root = homeChat_newChat_root, homeChat_newChat_content.newContactGad.target = homeChat_newChat_newContact_root
homeChat_newChat_newContact_top.backGad.root = homeChat_newChat_newContact_root, homeChat_newChat_newContact_top.backGad.target = homeChat_newChat_root
homeChat_newChat_newContact_bot.saveGad.formView = homeChat_newChat_newContact_content
homeChat_newChat_newContact_bot.saveGad.root = homeChat_newChat_newContact_root, homeChat_newChat_newContact_bot.saveGad.target = homeChat_newChat_root
chatRoom_bot.sendGad.root = chatRoom_root, chatRoom_bot.sendGad.target = menuRoot
