export default {
	packagerConfig: {
		name: "sparks-nmn-desktop",
		icon: "./logo/logo",
		ignore: (path) => {
			if(['', '/package.json'].includes(path)) {
				return false
			}
			if(path == '/dist' || path.startsWith('/dist/')) {
				return false
			}
			return true
		},
		win32metadata: {
			CompanyName: 'yezhiyi9670',
			FileDescription: 'Sparks NMN Desktop',
			ProductName: 'Sparks NMN Desktop'
		}
	},
	"electronRebuildConfig": {},
	makers: [
		// {
		// 	name: '@electron-forge/maker-squirrel',
		// 	config: {}
		// },
		{
			name: '@electron-forge/maker-zip',
		},
		{
			name: '@pengx17/electron-forge-maker-appimage',
		},
		// {
		// 	name: '@electron-forge/maker-deb',
		// 	config: {},
		// },
		// {
		// 	name: '@electron-forge/maker-rpm',
		// 	config: {},
		// },
	],
};
