import { app, BrowserWindow } from 'electron'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import path from 'path'
import { PrefBackend } from '../common/prefs/PrefBackend'
import { EventAppMain } from './evt/appmain'
import { EventSettings } from './evt/settings'
import { EventFileSystem } from './evt/filesystem'

EventAppMain.init()

// 记住上次的窗口大小
PrefBackend.initialize()

;(async () => {
	const windowSizePref = await PrefBackend.createPrefStorage('window-size', false)
	const settingsPref = await PrefBackend.createPrefStorage('settings', true)

	// 创建窗口
	function createWindow() {
		const win = new BrowserWindow({
			width: windowSizePref.getValue('number', 'windowWidth', 1536),
			height: windowSizePref.getValue('number', 'windowHeight', 864),
			show: false,
			webPreferences: {
				nodeIntegration: true,
				contextIsolation: true,
				preload: path.join(__dirname, '../preload/index.mjs'),
				defaultEncoding: 'UTF-8',
			},
		})
		win.setMenu(null)
		return win
	}

	// 准备好之后
	app.whenReady().then(() => {
		const win = createWindow()

		if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
			win.loadURL(process.env['ELECTRON_RENDERER_URL'])
		} else {
			win.loadFile(path.join(__dirname, '../renderer/index.html'))
		}

		// win.webContents.openDevTools({mode: 'right'})
		// win.show()

		// 正常情况下，窗口的显示由 AppMain 处理 loaded 事件

		// 记住窗口大小
		win.on('resized', async () => {
			const size = win.getSize()
			await windowSizePref.setValueAsync('number', 'windowWidth', size[0])
			await windowSizePref.setValueAsync('number', 'windowHeight', size[1])
			await windowSizePref.saveDataAsync()
		})
		EventAppMain.register(win)
		EventSettings.register(win, settingsPref)
		EventFileSystem.register(win, settingsPref)
	})
})()
