import fs from 'fs'

console.log('Copying printing wrapper')
if(fs.existsSync('../static-resources/dist/wrapper/template.html')) {
  const template_content = fs.readFileSync('../static-resources/dist/wrapper/template.html')
  fs.writeFileSync('./src/renderer/public/static/export-template.txt', template_content)
} else {
  throw Error('Printing wrapper is missing. Run `yarn build-wrapper` under the static-resources package first.')
}
