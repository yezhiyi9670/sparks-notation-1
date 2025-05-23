import $ from 'jquery'
import React from 'react'
import { NMNResult, SparksNMN } from '@sparks-notation/core'
import { Equifield, EquifieldSection } from '@sparks-notation/core/equifield/equifield'
import { LanguageArray } from '@sparks-notation/core/i18n'
import { lineRendererStats } from '@sparks-notation/core/renderer/article/line/LineRenderer'
import { positionDispatcherStats } from '@sparks-notation/core/renderer/article/line/positioning/PositionDispatcher'
import { domPaintStats } from '@sparks-notation/core/renderer/backend/DomPaint'
import { randomToken } from '@sparks-notation/util/random'
import { useMethod } from '@sparks-notation/util/hook'

type Props = {
	result: NMNResult | undefined
	language: LanguageArray
	doPagination?: boolean
	efRange?: [string, string]
	onPosition?: (row: number, col: number) => void
	cursor?: {
		code: string,
		position: [number, number]
	}
	onReportError?: (_err: any | undefined) => void
	transformFields?: (fields: EquifieldSection[]) => EquifieldSection[]
}
export function SparksNMNDisplay(props: Props) {
	const { onPosition, result, language } = props
	
	const divRef = React.createRef<HTMLDivElement>()

	const token = React.useMemo(() => randomToken(24), [])
	const tokenClass = `SparksNMN-preview-${token}`

	const positionCallback = useMethod((row: number, col: number) => {
		if(onPosition) {
			onPosition(row, col)
		}
	})

	let hasRendered = false
	let timing = 0
	const renderResult = React.useMemo(() => {
		// eslint-disable-next-line react-hooks/exhaustive-deps
		hasRendered = true
		if(result) {
			domPaintStats.measureTime = 0
			domPaintStats.domDrawTime = 0
			lineRendererStats.sectionsRenderTime = 0
			positionDispatcherStats.computeTime = 0
			let startTime = +new Date()
			const renderResult = (() => {
				try {
					let fields1 = SparksNMN.render(result.result, language, positionCallback)
					if(props.transformFields) {
						fields1 = props.transformFields(fields1)
					}
					if(props.doPagination) {
						fields1 = SparksNMN.paginize(result.result, fields1, language).result
					}
					return {
						fields: fields1,
						error: undefined,
					}
				} catch(_err) {
					console.error('Rendering error occured', _err)
					return {
						fields: [{
							element: $('<span style="font-size: 2em">Failed to render preview due to error.</span>')[0],
							height: 3,
							padding: [11, 11] as [number, number],
						} as EquifieldSection],
						error: _err,
					}
				}
			})()
			let endTime = +new Date()
			// eslint-disable-next-line react-hooks/exhaustive-deps
			timing = endTime - startTime

			return renderResult
		} else {
			return {
				fields: [{
					element: $('<span style="font-size: 2em">Loading preview...</span>')[0],
					height: 3,
					padding: [11, 11] as [number, number],
					label: 'loading'
				}],
				error: undefined,
				pages: NaN
			}
		}
	}, [result, language, props.transformFields])

	const renderResultFields = renderResult.fields
	React.useLayoutEffect(() => {
		if(props.onReportError) {
			props.onReportError(renderResult.error)
		}

		const element = divRef.current
		if(!element) {
			return
		}
		if(!$(element).hasClass(tokenClass)) {
			$(element).addClass(tokenClass)
		}
		let startTime = +new Date()

		const ef = new Equifield(element)
		// ef.field = 120
		// ef.padding = 10
		ef.resize()

		const labels = renderResultFields.map(field => field.label)
		let startIndex = 0
		let endIndex = labels.length
		if(props.efRange) {
			startIndex = Math.max(0, labels.indexOf(props.efRange[0]))
			endIndex = labels.lastIndexOf(props.efRange[1]) + 1
			if(endIndex == 0) {
				endIndex = labels.length
			}
		}

		ef.render(renderResultFields.slice(startIndex, endIndex))
		let endTime = +new Date()

		return () => {
			ef.destroy()
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [renderResultFields, tokenClass, props.efRange])

	React.useLayoutEffect(() => {
		if(!result) {
			return
		}
		$(`.${tokenClass} .SparksNMN-sechl`).css({visibility: 'hidden'})
		if(props.cursor) {
			const id = SparksNMN.getHighlightedSection(result.sectionPositions, props.cursor.code, props.cursor.position)
			$(`.${tokenClass} .SparksNMN-sechl-${id}`).css({visibility: 'visible'})
		}
	}, [result, renderResultFields, props.cursor, tokenClass])

	return <div ref={divRef}></div>
}
