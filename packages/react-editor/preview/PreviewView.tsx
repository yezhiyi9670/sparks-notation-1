import React, { createRef, useContext, useEffect, useMemo, useRef } from "react"
import { createUseStyles } from "react-jss"
import { NMNI18n, NMNLanguageArray, NMNResult } from "@sparks-notation/core"
import { SparksNMNPreview } from "../base/SparksNMNPreview"
import $ from 'jquery'
import { Equifield } from "@sparks-notation/core/equifield/equifield"
import { IntegratedEditorContext } from "../IntegratedEditor"
import { useOnceEffect } from "@sparks-notation/util/event"
import { RenderSectionPickCallback } from "@sparks-notation/core/renderer/renderer"

const useStyles = createUseStyles({
	root: {
		padding: '32px 0',
		paddingBottom: '320px',
		width: 'calc(100% + 1px)',
		boxSizing: 'border-box',
		userSelect: 'text',
		minHeight: '100%'
	},
	warningEf: {},
	'@media print': {
		warningEf: {
			display: 'none'
		},
		root: {
			border: 'none !important',
			'& .SparksNMN-sechl': {
				display: 'none'
			},
			'& .SparksNMN-notehl': {
				display: 'none'
			},
			'& .SparksNMN-secsel': {
				display: 'none !important'
			},
			'& .SparksNMN-validation': {
				display: 'none'
			}
		},
	}
})

export type PreviewCursor = {
	code: string,
	position: [number, number]
}

export function PreviewView(props: {
	result: NMNResult | undefined
	language: NMNLanguageArray
	onPosition?: (row: number, col: number) => void
	cursor?: PreviewCursor
	onReportTiming?: (value: number) => void
	onReportSize?: (value: number) => void
	onReportPages?: (value: number) => void
	highlightedNotes?: string[]
	pickingSections?: boolean
	onPickSection?: RenderSectionPickCallback
}) {
	const { language, prefs, colorScheme } = useContext(IntegratedEditorContext)

	const classes = useStyles()
	const warningDivRef = useRef<HTMLDivElement | null>(null)

	const prevMaxWidth = useRef(prefs.previewMaxWidth!)
	const maxWidth = prefs.previewMaxWidth!
	const updateWidth = prevMaxWidth.current != maxWidth
	prevMaxWidth.current = maxWidth
	const hasContent = !props.result || props.result.result.musicalProps

	useEffect(() => {
		if(updateWidth) {
			window.dispatchEvent(new Event('resize')) // 使 Equifield 更新其宽度
		}
		if(!hasContent) {
			props.onReportSize && props.onReportSize(0)
			props.onReportTiming && props.onReportTiming(0)
			props.onReportPages && props.onReportPages(NaN)
		}
	})
	useEffect(() => {
		if(warningDivRef.current) {
			const ef = new Equifield(warningDivRef.current)
			ef.render([{
				element: $('<div></div>').html(prefs.importantWarning?.html ?? '')[0],
				height: prefs.importantWarning?.height ?? 0,
				padding: [11, 11]
			}])
		}
	}, [prefs.importantWarning])

	const blankPreview = useMemo(() => (
		<PreviewBlank />
	), [])
	const alignMode = prefs.previewAlign!
	return (
		<div className={classes.root} style={{
			maxWidth: maxWidth,
			margin: (alignMode == 'center') ? '0 auto' : '',
			borderRight: (alignMode == 'left') ? '1px solid #0002' : ''
		}}>
			{prefs.importantWarning && <div ref={warningDivRef} className={classes.warningEf}></div>}
			{hasContent ? <SparksNMNPreview
				result={props.result}
				language={props.language}
				cursor={props.cursor}
				onPosition={props.onPosition}
				onReportTiming={props.onReportTiming}
				onReportSize={props.onReportSize}
				onReportPages={props.onReportPages}
				
				logTimeStat={prefs.logTimeStat}

				highlightedNotes={props.highlightedNotes}
				showSectionPickers={props.pickingSections ? ['*'] : []}
				onPickSection={props.onPickSection}
			/> : blankPreview}
		</div>
	)
}

function PreviewBlank(props: {}) {
	const { language, prefs, colorScheme } = useContext(IntegratedEditorContext)

	const divRef = createRef<HTMLDivElement>()

	useEffect(() => {
		let ef: Equifield | undefined = undefined
		if(divRef.current) {
			ef = new Equifield(divRef.current)
		}
		if(ef) {
			ef.render([
				{
					element: $('<span></span>').css({
						fontSize: '3em',
						fontWeight: 700,
						color: '#999'
					}).text(NMNI18n.editorText(language, 'preview.blank.title'))[0],
					height: 6,
					padding: [11, 11]
				},
				{
					element: $('<span></span>').css({
						fontSize: '2em',
						color: '#999'
					}).text(NMNI18n.editorText(language, 'preview.blank.desc.1'))[0],
					height: 4,
					padding: [11, 11]
				},
				{
					element: $('<span></span>').css({
						fontSize: '2em',
						color: '#999'
					}).text(NMNI18n.editorText(language, 'preview.blank.desc.2'))[0],
					height: 4,
					padding: [11, 11]
				},
			])
		}
		return () => {
			ef && ef.destroy()
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [language])

	return <div ref={divRef}></div>
}
