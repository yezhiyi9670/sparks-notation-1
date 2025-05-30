import { Ace } from "ace-builds"
import React, { useImperativeHandle } from "react"
import { SparksNMNLanguage, NMNI18n, NMNIssue, SparksNMN } from "@sparks-notation/core"
import { CodeEditor } from "./CodeEditor/CodeEditor"
import AceEditor from 'react-ace'
import 'ace-builds/src-noconflict/mode-plain_text'
import './mode/sparksnmn'
import { renderPropsDefault, renderPropsDocumentOnlyKeys, renderPropsFragmentLevelExclusiveKeys } from "@sparks-notation/core/renderer/props"
import { iterateMap } from "@sparks-notation/util/array"
import { LanguageArray } from "@sparks-notation/core/i18n"

interface SparksNMNEditorProps {
	name: string
	language: LanguageArray
	value?: string
	onChange?: (_: string) => void
	onCursorChange?: (val: string) => void
	issues?: NMNIssue[]
	ref?: React.Ref<AceEditor>
	fontSize?: number
}
// eslint-disable-next-line react/display-name
export const SparksNMNEditor = React.forwardRef((props: SparksNMNEditorProps, parentRef: React.Ref<AceEditor>) => {
	const ref = React.useRef<AceEditor>(null)

	useImperativeHandle(parentRef, () => {
		if(ref.current) {
			ref.current.editor.session.setAnnotations(annotations)
		}
		return ref.current!
	})

	const languageArray = props.language

	const annotations: Ace.Annotation[] = React.useMemo(() => {
		const ret = props.issues?.map((issue) => {
			return {
				row: Math.max(0, issue.lineNumber - 1),
				column: issue.index,
				type: issue.severity == 'error' ? 'error' : 'warning',
				text: NMNI18n.issueDescription(languageArray, issue)
			}
		}) ?? []
		return ret
	}, [ props.issues, languageArray ])

	function handleLoad(editor: Ace.Editor) {
		editor.completers = []
		editor.completers.push({
			getCompletions: (editor, session, pos, prefix, callback) => {
				const text = session.getValue()
				const converted = SparksNMN.unconvertCursor(text, [ pos.row + 1, pos.column ])
				
				const lineText = converted.code
				let linePrefixText = lineText.substring(0, converted.position[1]).trim()
				// ===== 行首标识符自动补全 =====
				if(linePrefixText == prefix) {
					const completes: Ace.Completion[] = SparksNMNLanguage.commandDefs.map((val): Ace.Completion => {
						return {
							caption: val.head,
							value: val.head + ': ',
							score: 100,
							meta: NMNI18n.commandDescription(languageArray, val.head)
						}
					}).concat(SparksNMNLanguage.commandDefs.map((val): Ace.Completion => {
						return {
							caption: val.headFull,
							value: val.headFull + ': ',
							score: 90,
							meta: NMNI18n.commandDescription(languageArray, val.head),
						}
					})).filter((suggest) => {
						if(suggest.caption!.slice(0, prefix.length).toLocaleLowerCase() == prefix.toLocaleLowerCase()) {
							return true
						}
						return false
					})
					callback(null, completes)
					return
				}
				// ===== 渲染属性自动补全 =====
				if(/^(Rp|Srp|Frp)(.*?):/.test(linePrefixText) && !/=(\S*)$/.test(linePrefixText)) {
					const completes = iterateMap(renderPropsDefault as any, (value, key): Ace.Completion => {
						return {
							caption: key,
							value: key + '=',
							score: 100,
							meta: NMNI18n.renderPropsDesc(languageArray, key)
						}
					}).filter(item => {
						if(!linePrefixText.startsWith('Rp')) {
							if(renderPropsDocumentOnlyKeys.includes(item.caption ?? '')) {
								return false
							}
						}
						if(linePrefixText.startsWith('Frp')) {
							if(!renderPropsFragmentLevelExclusiveKeys.includes(item.caption ?? '')) {
								return false
							}
						}
						return true
					})
					callback(null, completes)
				}
			}
		})
	}
	
	return <CodeEditor
		name={props.name}
		mode='sparksnmn'
		value={props.value ?? ''}
		onChange={props.onChange}
		onCursorChange={props.onCursorChange}
		ref={ref}
		lineWrap={false}
		onLoad={handleLoad}
		fontSize={props.fontSize}
	/>
})
