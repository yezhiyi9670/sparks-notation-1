import React, { createElement, createRef, ReactNode, useEffect, useMemo, useRef } from "react"
import { createUseStyles } from "react-jss"
import { useOnceEffect } from "@sparks-notation/util/event"
import { callRef, useMethod } from "@sparks-notation/util/hook"
import $ from 'jquery'
import { IntegratedEditor, IntegratedEditorApi, IntegratedEditorPrefs } from "@sparks-notation/react-editor/IntegratedEditor"
import { useI18n } from "./i18n/i18n"
import { NMNI18n } from "@sparks-notation/core"
import corePackageJson from '@sparks-notation/core/package.json'

const defaultSrcText = `Dt: 新文档
Ds: 副标题
Dv: Version ${corePackageJson.version}
Da[作词]: ???
Da[作曲]: ???
P: 1=C 4/4
Rp: page=A4 font_lyrics=Roman,CommonSerif/600/0.95
===
N: (13)(24)(35)(46) | (57)(61e)(72e)(1e6) | (75)(64)(53)(42) | (31)(27d) 1 - |||
===
T: 这是一份默认的乐谱代码。
T: 你可以自行尝试修改它以探索功能，或者在网站上打开“示例乐谱”页面查看更多例子。
`

const useStyles = createUseStyles({
	outer: {
		height: '100%',
		display: 'flex',
		flexDirection: 'column',
		userSelect: 'none'
	},
	header: {
		height: '48px',
		borderBottom: '1px solid #00000029',
		backgroundColor: '#FAFAFA',
		boxSizing: 'border-box',
		padding: '0 12px',
		verticalAlign: 'middle',
		display: 'none'
	},
	headerText: {
		display: 'table-cell',
		height: '48px',
		verticalAlign: 'middle',
		fontSize: '18px',
		opacity: 0.6,
		userSelect: 'none'
	},
	inner: {
		flex: 'auto',
		overflow: 'hidden'
	},
	'@media print': {
		outer: {
			height: 'unset'
		},
		header: {
			display: 'none'
		},
		inner: {
			padding: '16px'
		}
	}
})

type PageHeaderProps = {
	text: string
	children: ReactNode
	onKeyDown?: (evt: React.KeyboardEvent) => void
}
export function PageHeader(props: PageHeaderProps) {
	const classes = useStyles()
	return <div className={classes.outer} onKeyDown={props.onKeyDown}>
		<div className={classes.header}>
			<div className={classes.headerText}>
				{props.text}
			</div>
		</div>
		<div className={classes.inner}>
			{props.children}
		</div>
	</div>
}

function getQueryVariable(variable: string) {
	var query = window.location.search.substring(1);
	var vars = query.split("&");
	for (var i = 0; i < vars.length; i++) {
		var pair = vars[i].split("=");
		if (pair[0] == variable) { return decodeURIComponent(pair[1]); }
	}
	return undefined
}

const isMobileInitially = window.innerWidth <= 900

export function TestApp() {
	const editorRef = createRef<IntegratedEditorApi>()
	const LNG = useI18n()

	useEffect(() => {
		const loadLoc = getQueryVariable('load-example')
		if(loadLoc !== undefined) {
			const loc = 'example/' + loadLoc + '?time=' + (+new Date())
			if(loc.startsWith('//') || loc.includes(':') || loc.includes('..')) {
				console.warn('The request of loading file', loc, 'is blocked because it does not look safe')
			} else {
				$.get(loc, (data) => {
					if(typeof(data) == 'string' && !data.trim().startsWith('<')) {
						localStorage.setItem('sparks-nmn-demo-src', data)
						callRef(editorRef, api => {
							api.triggerOpen({path: '', content: data})
							history.replaceState(undefined, '', location.origin + location.pathname)
						})
					} else {
						console.warn('Failed to load file', loc)
					}
				})
			}
		} else {
			// load localStorage data
			
			callRef(editorRef, api => {
				const storedData = localStorage.getItem('sparks-nmn-demo-src')
				const data = storedData != null ? storedData : defaultSrcText
				api.triggerOpen({path: '', content: data})
			})
		}
	}, [])

	function handleSave() {
		callRef(editorRef, api => {
			api.triggerBeforeSave()
			if(api.getIsDirty()) {
				localStorage.setItem('sparks-nmn-demo-src', api.getValue())
				api.triggerSaved('')
			}
		})
	}

	function handleKeyDown(evt: React.KeyboardEvent) {
		if(evt.ctrlKey && !evt.shiftKey) {
			if(evt.key.toLowerCase() == 's') {
				evt.preventDefault()
				handleSave()
			} else if(evt.key.toLowerCase() == 'r') {
				evt.preventDefault()
				callRef(editorRef, api => {
					api.triggerBeforeSave()
				})
			}
		}
	}

	/**
	 * 导出完成
	 */
	const handleExportFinish = useMethod((data: Uint8Array) => {
		const blob = new Blob([data], {type: 'audio/ogg'})
		const url = URL.createObjectURL(blob)
		window.prompt(LNG('export_finish'), url)
		
		const ele = document.createElement('textarea')
		ele.setAttribute('readonly', 'readonly')
		ele.value = url
		document.body.appendChild(ele)
		ele.focus()
		ele.select()
		console.log(url, document.execCommand('copy'))
		ele.remove()

		setTimeout(() => {
			URL.revokeObjectURL(url)
		}, 120 * 1000)
	})

	const editorPrefs = useMemo((): IntegratedEditorPrefs => ({
		modifyTitle: {
			default: LNG('title.default'),
			new: LNG('title.new'),
			newDirty: LNG('title.newDirty'),
			clean: LNG('title.new'),
			dirty: LNG('title.newDirty'),
		},
		importantWarning: {html: `
			<div class="demo-important-warning-title" style="font-family: sans-serif; width: 100%; font-size: 1.8em; padding: 1.2em; border-radius: 1em; background: #f6f8fa; color: #193c47">
				<div style="display: flex; align-items: center; height: 2.7em; gap: 0.6em;">
					<a target="_blank" href="${LNG('preview.heading#html.backlink')}" style="display: flex; height: 2.7em; gap: 0.6em; align-items: center; color: inherit; text-decoration: none;">
						<img style="height: 2.7em; width: 2.7em; object-fit: contain" src="${LNG('preview.heading#html.icon')}" />
						<span style="font-size: 1.4em; font-weight: 700">${LNG('preview.heading#html.title')}</span>
					</a>
					<span style="font-size: 1.4em; opacity: 0.55">${LNG('preview.heading#html.title_ext')}</span>
				</div>
				<div class="demo-important-warning-text" style="font-size: 1.05em; margin-top: 1em; line-height: 1.4em; height: 4.2em; color: #193c47; white-space: nowrap;">
					${LNG('preview.heading#html.text.1')}<br />
					${LNG('preview.heading#html.text.2')}<br />
					${LNG('preview.heading#html.text.3')}
				</div>
				<div class="demo-important-warning-keys" style="font-size: 1.05em; margin-top: 0.85em; line-height: 1.4em; height: 2.85em; color: #7d9198; white-space: nowrap;">
					<code style="font-family: CommonBlack; background: #f9f9f9; border: 0.1em solid #7d9198; border-radius: 0.3em; padding: 0.05em 0.15em">Ctrl</code>
					+
					<code style="font-family: CommonBlack; background: #f9f9f9; border: 0.1em solid #7d9198; border-radius: 0.3em; padding: 0.05em 0.15em">S</code>
					${LNG('preview.heading#html.key.save')}

					<span style="display: inline-block; width: 1.35em"></span>
					
					<code style="font-family: CommonBlack; background: #f9f9f9; border: 0.1em solid #7d9198; border-radius: 0.3em; padding: 0.05em 0.15em">Ctrl</code>
					+
					<code style="font-family: CommonBlack; background: #f9f9f9; border: 0.1em solid #7d9198; border-radius: 0.3em; padding: 0.05em 0.15em">R</code>
					${LNG('preview.heading#html.key.refresh')}

					<span style="display: inline-block; width: 1.35em"></span>

					<code style="font-family: CommonBlack; background: #f9f9f9; border: 0.1em solid #7d9198; border-radius: 0.3em; padding: 0.05em 0.15em">Ctrl</code>
					+
					<code style="font-family: CommonBlack; background: #f9f9f9; border: 0.1em solid #7d9198; border-radius: 0.3em; padding: 0.05em 0.15em">P</code>
					${LNG('preview.heading#html.key.print')}

					<br />

					${LNG('preview.heading#html.key.hint')}
				</div>
			</div>
		`, height: 29.5},
		temporarySave: true,
		isMobile: isMobileInitially,
		inspectorOpen: false,
		logTimeStat: true,
		instrumentSourceUrl: './core-resources/audio/',
		onAudioExport: handleExportFinish,
		previewRefresh: 'delay1000'
	}), [LNG, handleExportFinish])

	return <PageHeader text="Sparks NMN Dev Demo" onKeyDown={handleKeyDown}>
		<IntegratedEditor onRequestSave={handleSave} ref={editorRef} editorPrefs={editorPrefs} language={NMNI18n.languages.zh_cn} />
	</PageHeader>
}
