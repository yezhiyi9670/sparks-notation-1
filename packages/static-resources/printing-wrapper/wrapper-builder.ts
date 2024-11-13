import fs from 'fs'

const paths = {
	wrapper_source: './printing-wrapper/',
	built: './dist/wrapper/assets/',
	dist: './dist/wrapper/',
	core: '../core/',
}

let templateText = fs.readFileSync(paths.wrapper_source + 'template.html').toString()

const getFontStyles = () => {
	return ``
}
const getFontScript = () => {
	const fonts = [
		{ family: 'CommonLight', name: 'noto_sans_sc_light', format: 'woff2', asc: undefined, desc: undefined },
		{ family: 'CommonLight', name: 'noto_sans_sc_light', format: 'woff2', weight: 'bold', asc: undefined, desc: undefined },
		{ family: 'CommonSerif', name: 'uming_cn_dotfix', format: 'woff2' },
		{ family: 'CommonSerif', name: 'uming_cn_dotfix', format: 'woff2', weight: 'bold' },
		{ family: 'CommonBlack', name: 'wqy_microhei', format: 'woff2' },
		{ family: 'Roman', name: 'roman', format: 'woff2' },
		{ family: 'Roman', name: 'roman', format: 'woff2', weight: 'bold' },
		{ family: 'RomanItalic', name: 'roman_italic', format: 'woff2' },
		{ family: 'SparksNMN-EOPNumber', name: 'eop_number', format: 'ttf' },
		{ family: 'SparksNMN-mscore-20', name: 'mscore-20', format: 'ttf' },
		{ family: 'SparksNMN-Bravura', name: 'bravura', format: 'woff' },
	]
	return `window.fontLoadData = ${JSON.stringify(fonts.map(font => ({
		name: font.family,
		url: `${font.name}/${font.name}${font.weight ? ('-transformed-' + font.weight) : ''}.${font.format}`,
		weight: font.weight ?? 'normal',
		asc: font.asc,
		desc: font.desc,
	})))}`
}
const replaceFields = (src: string, replacer: (text: string, contentType: string, protocol: string, location: string) => string): string => {
	return src.replace(/\/\*\{(\w+):(\w+):(.*?)\}\*\//g, replacer)
}

templateText = replaceFields(templateText, (text, contentType, protocol, location) => {
	if(protocol == 'built') {
		return fs.readFileSync(paths.built + location).toString()
	}
	if(protocol == 'wrapper_source') {
		return fs.readFileSync(paths.wrapper_source + location).toString()
	}
	if(protocol == 'core') {
		return fs.readFileSync(paths.core + location).toString()
	}
	if(protocol == 'dynamic') {
		if(location == 'fonts.css') {
			return getFontStyles()
		} else if(location == 'fonts-loader.js') {
			return getFontScript()
		}
	}
	return text
})

fs.writeFileSync(paths.dist + 'template.html', templateText)

templateText = replaceFields(templateText, (text, contentType, protocol, location) => {
	if(protocol == 'content') {
		if(location == 'data') {
			return fs.readFileSync(paths.wrapper_source + 'test-data.txt').toString()
		} else if(location == 'flags') {
			return 'window.localFontLocation = "../../core-resources/font"'
		}
	}
	return text
})

fs.writeFileSync(paths.dist + 'test.html', templateText)

export {}
