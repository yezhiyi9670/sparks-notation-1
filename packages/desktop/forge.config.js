// forge.config.js
export default async (forgeConfig) => {
  const isMac = process.platform === 'darwin';
  const isWin = process.platform === 'win32';
  const isLinux = process.platform === 'linux';

  const config = {
    packagerConfig: {
      name: "sparks-nmn-desktop",
      icon: isMac ? "./logo/logo" : (isWin ? "./logo/logo.ico" : "./logo/logo.png"),
      asar: {
        unpackDir: 'dist/renderer/core-resources/font'
      },
      ignore: (path) => {
        if (['', '/package.json', '/logo'].includes(path) || path.startsWith('/logo/')) return false;
        if (path == '/dist' || path.startsWith('/dist/')) return false;
        return true;
      },
      // Mac
      ...(isMac && {
        appBundleId: 'com.yourcompany.sparks-nmn',
        entitlements: 'build/entitlements.mac.plist',
        hardenedRuntime: true,
        gatekeeperAssess: false,
      }),
      // Windows
      ...(isWin && {
        win32metadata: {
          CompanyName: 'yezhiyi9670',
          FileDescription: 'Sparks NMN Desktop',
          ProductName: 'Sparks NMN Desktop'
        }
      })
    },
    makers: [
      // 通用 maker（如 zip 适用所有平台）
      {
        name: '@electron-forge/maker-zip',
        platforms: ['win32', 'linux']
      },
      // Mac 专用 maker
      ...(isMac ? [
        {
          name: '@electron-forge/maker-dmg',
          //   config: {
          //     background: './build/dmg-background.png',
          //     format: 'ULFO',
          //     icon: './logo/logo.icns',
          //     name: 'Sparks NMN',
          //     overwrite: true
          //   }
        }
      ] : []),
      // Linux 专用 maker
      ...(isLinux ? [
        {
          name: '@pengx17/electron-forge-maker-appimage',
          config: {}
        }
      ] : [])
    ]
  };

  return config;
};