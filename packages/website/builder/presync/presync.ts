import fs from 'fs'
import path from 'path'

const demo_dist_dir = '../demo/dist/'
const playground_dir = './static/playground/'

console.log('Cleaning playground dir')
for(let name of fs.readdirSync(playground_dir)) {
  if(['.', '..', '.htaccess', 'example'].includes(name)) {
    continue;
  }
  const pth = path.join(playground_dir, name)
  if(fs.statSync(pth).isFile()) {
    fs.unlinkSync(pth)
  } else {
    fs.rmSync(pth, { recursive: true })
  }
}

console.log('Copying playground')
if(!fs.existsSync(path.join(demo_dist_dir, 'index.html'))) {
  throw Error('Demo is missing. Run `yarn build` in the `demo` package first.')
}
fs.cpSync(demo_dist_dir, playground_dir, { recursive: true })

import package_core from '../../../core/package.json'
import package_desktop from '../../../desktop/package.json'

console.log('Writing version info')
fs.writeFileSync('./static/latest-version.json', JSON.stringify({
  version: package_core.version,
  desktop_version: package_desktop.version
}))
