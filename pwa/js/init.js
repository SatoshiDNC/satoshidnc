import { barTop as home_chats_top } from './view/home/chats/bar-top.js'
import { barTop as home_chats_new_top } from './view/home/chats/new-chat/bar-top.js'
import { barTop as chatRoomBar } from './view/chat-room/bar-top.js'
import { menuRoot } from './view/menu.js'
import { chatRoomRoot as chatRoom_root } from './view/chat-room/root.js'
import { homeRoot as home_chats_root } from './view/home/chats/root.js'
import { homeRoot as home_updates_root } from './view/home/updates/root.js'
import { homeRoot as home_communities_root } from './view/home/communities/root.js'
import { homeRoot as home_calls_root } from './view/home/calls/root.js'
import { contentView as home_chats_content, overlayView as home_chats_overlay } from './view/home/chats/content.js'
import { newChatRoot as home_chats_new_root } from './view/home/chats/new-chat/root.js'
import { contentView as homeChat_newChat_content} from './view/home/chats/new-chat/content.js'
import { barTop as homeChat_newChat_newContact_top } from './view/home/chats/new-chat/new-contact/bar-top.js'
import { newContactRoot as homeChat_newChat_newContact_root } from './view/home/chats/new-chat/new-contact/root.js'
import { barBot as homeChat_newChat_newContact_bot } from './view/home/chats/new-chat/new-contact/bar-bot.js'
import { contentView as homeChat_newChat_newContact_content } from './view/home/chats/new-chat/new-contact/content.js'
import { barBot as chatRoom_bot } from './view/chat-room/bar-bot.js'
import { menuRoot as chatRoom_sendAs_root } from './view/chat-room/send-as/menu.js'
import { menuRoot as homeChat_trezorTools_root, menuView as homeChat_trezorToolsView } from './view/home/chats/tools-trezor.js'
import { menuRoot as homeChat_nostorTools_root, menuView as homeChat_nostorToolsView } from './view/home/chats/tools-nostor.js'
import { settingsRoot as settings_root } from './view/settings/root.js'
import { barTop as settings_top } from './view/settings/bar-top.js'
import { contentView as settings_content } from './view/settings/content.js'
import { profileRoot as settings_profile_root } from './view/settings/profile/root.js'
import { barTop as settings_profile_top } from './view/settings/profile/bar-top.js'
import { popupDissolveRoot as profile_popup_root2, popupView as profile_popup_content } from './view/home/chats/profile/popup.js'
import { contentView as profile_info_root } from './view/home/chats/profile/info/content.js'
import { barBot as home_bot } from './view/home/bar-bot.js'
import { overlayView as home_updates_overlay } from './view/home/updates/overlay.js'
import { contentView as home_updates_content } from './view/home/updates/content.js'
import { rootView as home_updates_display_root } from './view/home/updates/display/root.js'
import { overlayView as home_updates_display_overlay } from './view/home/updates/display/overlay.js'
import { rootView as home_updates_verbal_root } from './view/home/updates/verbal/root.js'
import { overlayView as home_updates_verbal_overlay } from './view/home/updates/verbal/overlay.js'

home_chats_top.menuGad.root = home_chats_root
home_chats_top.menuGad.target = menuRoot
home_chats_top.menuGad.target2 = homeChat_trezorTools_root
home_chats_top.menuGad.target3 = homeChat_nostorTools_root
home_chats_top.menuGad.targetSettings = settings_root
home_chats_new_top.backGad.root = home_chats_new_root, home_chats_new_top.backGad.target = home_chats_root
home_chats_new_top.menuGad.root = home_chats_new_root
home_chats_new_top.menuGad.target = menuRoot
home_chats_new_top.menuGad.target2 = homeChat_trezorTools_root
chatRoomBar.backGad.root = chatRoom_root, chatRoomBar.backGad.target = home_chats_root
chatRoomBar.menuGad.target = menuRoot
home_chats_content.listGad.root = home_chats_root, home_chats_content.listGad.target = chatRoom_root, home_chats_content.listGad.target2 = home_updates_display_root
home_chats_overlay.addGad.root = home_chats_root, home_chats_overlay.addGad.target = home_chats_new_root
homeChat_newChat_content.newContactGad.root = home_chats_new_root, homeChat_newChat_content.newContactGad.target = homeChat_newChat_newContact_root
homeChat_newChat_content.listGad.root = home_chats_new_root, homeChat_newChat_content.listGad.target = chatRoom_root
homeChat_newChat_newContact_top.backGad.root = homeChat_newChat_newContact_root, homeChat_newChat_newContact_top.backGad.target = home_chats_new_root
homeChat_newChat_newContact_bot.saveGad.formView = homeChat_newChat_newContact_content
homeChat_newChat_newContact_bot.saveGad.root = homeChat_newChat_newContact_root, homeChat_newChat_newContact_bot.saveGad.target = home_chats_new_root
chatRoom_bot.sendGad.root = chatRoom_root, chatRoom_bot.sendGad.target = chatRoom_sendAs_root
homeChat_trezorToolsView.menuGad.newContactRoot = homeChat_newChat_newContact_root
homeChat_nostorToolsView.menuGad.newContactRoot = homeChat_newChat_newContact_root
settings_top.backGad.root = settings_root, settings_top.backGad.target = home_chats_root
settings_content.profileGad.root = settings_root, settings_content.profileGad.target = settings_profile_root
settings_profile_top.backGad.root = settings_profile_root, settings_profile_top.backGad.target = settings_root
profile_popup_content.infoGad.target = profile_info_root, profile_popup_content.infoGad.root = profile_popup_root2
profile_info_root.backGad.target = home_chats_root, profile_info_root.backGad.root = profile_info_root
home_bot.panes.filter(p => p.label == 'Chats')[0].view = home_chats_root
home_bot.panes.filter(p => p.label == 'Updates')[0].view = home_updates_root
home_bot.panes.filter(p => p.label == 'Communities')[0].view = home_communities_root
home_bot.panes.filter(p => p.label == 'Calls')[0].view = home_calls_root
home_updates_display_overlay.returnViewDefault = home_updates_root
home_updates_display_overlay.profileGad.target = profile_info_root
home_updates_verbal_overlay.returnViewDefault = home_updates_root
home_updates_content.selfsGad.root = home_updates_root, home_updates_content.selfsGad.target = home_updates_display_root
home_updates_content.recentsGad.root = home_updates_root, home_updates_content.recentsGad.target = home_updates_display_root
home_updates_content.viewedGad.root = home_updates_root, home_updates_content.viewedGad.target = home_updates_display_root
home_updates_overlay.cameraGad.root = home_updates_root, home_updates_overlay.cameraGad.target = home_updates_verbal_root
home_updates_overlay.pencilGad.root = home_updates_root, home_updates_overlay.pencilGad.target = home_updates_verbal_root
home_updates_verbal_overlay.closeGad.root = home_updates_verbal_root, home_updates_verbal_overlay.closeGad.target = home_updates_root
