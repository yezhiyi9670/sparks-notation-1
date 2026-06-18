import { ipcRenderer } from 'electron'
import PrefAPI from './api/PrefAPI'
import Path from './api/Path'
import FileSystem from './api/FileSystem'
import AppMain from './api/AppMain'
import Versions from './api/Versions'

const ALLOWED_IPC_CHANNELS = ['menu-command']

const ipc = {
	/**
   * 监听主进程发来的事件
   * @param channel 通道名称（必须在白名单内）
   * @param listener 回调函数
   */
	on(channel: string, listener: (...args: any[]) => void) {
		if (ALLOWED_IPC_CHANNELS.includes(channel)) {
			ipcRenderer.on(channel, listener)
		} else {
			console.warn(`[IPC] 不允许监听通道: ${channel}`)
		}
	},

	/**
	 * 取消监听
	 * @param channel 通道名称
	 * @param listener 之前注册的回调函数
	 */
	off(channel: string, listener: (...args: any[]) => void) {
		if (ALLOWED_IPC_CHANNELS.includes(channel)) {
			ipcRenderer.off(channel, listener)
		} else {
			console.warn(`[IPC] 不允许取消监听通道: ${channel}`)
		}
	}
}

export default {
	PrefAPI, Versions, FileSystem, AppMain, Path, ipc,
} as { [_: string]: any }

declare global {
	interface Window {
		PrefAPI: typeof PrefAPI,
		Versions: typeof Versions,
		FileSystem: typeof FileSystem,
		AppMain: typeof AppMain,
		Path: typeof Path,
		ipc: typeof ipc,
	}
}
