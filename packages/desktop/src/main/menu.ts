import { Menu, BrowserWindow, app, MenuItemConstructorOptions, shell, dialog } from 'electron'
import fs from 'fs'
const isMac = process.platform === 'darwin'

// 定义菜单模板
export function buildMenu(win: BrowserWindow) {
	const template = [
		...(isMac
			? [{
				label: app.getName(),
				submenu: [
					{ role: 'about' },
					{ type: 'separator' },
					{
						label: 'Preferences...',
						accelerator: 'CmdOrCtrl+,',
						click: () => win.webContents.send('menu-command', 'settings')
					},
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
				
				{
					label: '新建',
					accelerator: 'CmdOrCtrl+N',
					click: () => win.webContents.send('menu-command', 'new')
				},
				{
					label: '打开文件',
					accelerator: 'CmdOrCtrl+O',
					click: () => win.webContents.send('menu-command', 'open')
				},
				isMac ? { role: 'close' } : { role: 'quit' },
				{ type: 'separator' },
				{
					label: '保存',
					accelerator: 'CmdOrCtrl+S',
					click: () => win.webContents.send('menu-command', 'save')
				},
				{
					label: '另存为',
					accelerator: 'CmdOrCtrl+Alt+S',
					click: () => win.webContents.send('menu-command', 'save-as')
				},
				{ type: 'separator' },
				{
					label: '导出 HTML',
					accelerator: 'CmdOrCtrl+E',
					click: () => win.webContents.send('menu-command', 'export-html')
				},
				{
					label: '打印',
					accelerator: 'CmdOrCtrl+P',
					click: () => win.webContents.send('menu-command', 'print')
				}
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
						await shell.openExternal('https://notation.sparkslab.art/docs/intro')
					}
				},
				{ type: 'separator' },
				{
					label: '赞助作者',
					click: async () => {
						await shell.openExternal('https://afdian.com/a/yezhiyi9670')
					}
				},
				{
					label: '帮忙开发',
					click: async () => {
						await shell.openExternal('https://github.com/yezhiyi9670/sparks-notation-1')
					}
				},
			]
		}
	]
	return Menu.buildFromTemplate(template)
}
