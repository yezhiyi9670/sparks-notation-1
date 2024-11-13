import React from 'react'
import { createRoot } from 'react-dom/client'

import { SparksNMN } from '@sparks-notation/core'
import { TestApp } from './app/TestApp'
import { I18nProvider } from './app/i18n/i18n'

import $ from 'jquery'

function ConsoleTest() {
	// console.log(md5('abc'))
	// console.log('Complicated')
	// console.log(Parser.parse(nmnExamples.structure_complicated))
	// console.log('Multisection')
	// console.log(Parser.parse(nmnExamples.strcture_multiSection))
	// console.log('Multipart')
	// console.log(Parser.parse(nmnExamples.basics_multiPart))
	// console.log('Fracs')
	// console.log(Frac.repr(Frac.create(3, 2)))
	// console.log(Frac.repr(Frac.__sum(Frac.create(1, 2), Frac.create(1, 6), Frac.create(1, 3))))
	// console.log(Frac.repr(Frac.prod(Frac.create(1, 2), Frac.create(2, 3), Frac.create(3, 4))))
	// console.log('Abs Names')
	// console.log(MusicTheory.absName2Pitch('C4'))
	// console.log(MusicTheory.absName2Pitch('C5'))
	// console.log(MusicTheory.absName2Pitch('C3'))
	// console.log(MusicTheory.absName2Pitch('##C4'))
	// console.log(MusicTheory.absName2Pitch('#B4'))
	// console.log(MusicTheory.absName2Pitch('C13'))
	// console.log('Degrees')
	// console.log(MusicTheory.pitchInterval2dKey(1, 'th'))
	// console.log(MusicTheory.pitchInterval2dKey(1, 'thd'))
	// console.log(MusicTheory.pitchInterval2dKey(1, 'thm'))
	// console.log(MusicTheory.pitchInterval2dKey(4, 'thm'))
	// console.log(MusicTheory.pitchInterval2dKey(5, 'thm'))
	// console.log(MusicTheory.pitchInterval2dKey(8, 'th'))
	// console.log(MusicTheory.pitchInterval2dKey(-8, 'th'))
	// return <></>
}

function App() {
	return <>
		{/* 此处的印刷样式需要与 @sparks-notation/static-resources/printing-wrapper/template.html 保持一致 */}
		<style>{`
			@page {
				margin-left: 0cm;
				margin-right: 0cm;
				margin-top: 8.0vw;
				margin-bottom: 8.0vw;
			}
			html, body {
				padding: 0;
				margin: 0;
			}
		`}</style>
		<TestApp />
	</>
}

SparksNMN.fontLoader.requestFontLoad('./core-resources/font', () => {
	createRoot(document.getElementById('root')!).render(
		<I18nProvider languageKey='zh_cn'>
			<App />
		</I18nProvider>
	)
}, (progress, total) => {
	if($('.root-loading').length == 0) {
		return
	}
	$('.root-progress').text(progress)
	$('.root-total').text(total)
	$('.root-bar-in').css('width', `${progress / total * 100}%`)
})
