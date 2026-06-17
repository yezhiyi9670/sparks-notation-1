import { Menu, BrowserWindow, app, MenuItemConstructorOptions } from 'electron'
import { EventFileSystem } from './evt/filesystem'

const isMac = process.platform === 'darwin'

// 定义菜单模板
export const menuTemplate = [
	...(isMac
		? [{
			label: "app",
			submenu: [
				{ role: 'about' },
				{ type: 'separator' },
				{ role: 'services' },
				{ type: 'separator' },
				{ role: 'hide' },
				{ role: 'hideOthers' },
				{ role: 'unhide' },
				{ type: 'separator' },
				{ role: 'quit' }
			]
		}]
		: []),
	// 文件菜单
	{
		label: 'File',
		submenu: [
			isMac ? { role: 'close' } : { role: 'quit' }
		]
	},
	// 编辑菜单
	{
		label: 'Edit',
		submenu: [
			{ role: 'undo' },
			{ role: 'redo' },
			{ type: 'separator' },
			{ role: 'cut' },
			{ role: 'copy' },
			{ role: 'paste' },
			...(isMac
				? [
					{ role: 'pasteAndMatchStyle' },
					{ role: 'delete' },
					{ role: 'selectAll' },
					{ type: 'separator' },
					{
						label: 'Speech',
						submenu: [
							{ role: 'startSpeaking' },
							{ role: 'stopSpeaking' }
						]
					}
				]
				: [
					{ role: 'delete' },
					{ type: 'separator' },
					{ role: 'selectAll' }
				])
		]
	},
	// 视图菜单
	{
		label: 'View',
		submenu: [
			{ role: 'reload' },
			{ role: 'forceReload' },
			{ role: 'toggleDevTools' },
			{ type: 'separator' },
			{ role: 'resetZoom' },
			{ role: 'zoomIn' },
			{ role: 'zoomOut' },
			{ type: 'separator' },
			{ role: 'togglefullscreen' }
		]
	},
	// 窗口菜单
	{ role: 'windowMenu' },
	{
		role: 'help',
		submenu: [
			{
				label: '在线手册',
				click: async () => {
					const { shell } = require('electron')
					await shell.openExternal('https://notation.sparkslab.art/docs/intro')
				}
			},
			{ type: 'separator' }
			,
			{
				label: '赞助作者',
				click: async () => {
					const { shell } = require('electron')
					await shell.openExternal('https://afdian.com/a/yezhiyi9670')
				}
			},
			{
				label: '帮忙开发',
				click: async () => {
					const { shell } = require('electron')
					await shell.openExternal('https://github.com/yezhiyi9670/sparks-notation-1')
				}
			},
		]
	}
]

export const menu = Menu.buildFromTemplate(menuTemplate)