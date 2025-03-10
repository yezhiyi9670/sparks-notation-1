import { NMNResult } from ".."
import { EquifieldSection } from "../equifield/equifield"
import { I18n, LanguageArray } from "../i18n"
import { addRenderProp, scoreContextDefault } from "../parser/sparse2des/context"
import { getLanguageValue } from "@sparks-notation/util/template"
import { FontMetric } from "./FontMetric"
import { DomPaint } from "./backend/DomPaint"

class PaginizerClass {
	paginize(result: NMNResult['result'], fields: EquifieldSection[], lng: LanguageArray): {
		result: EquifieldSection[]
		pages: number
	} {
		const renderProps = addRenderProp(scoreContextDefault, result.renderProps?.props).render
		const scale = renderProps.scale!
		const doubleSided = renderProps.double_sided!
		const pageMarginX = renderProps.page_margin_x!

		const separatorField = 12
		const separatorWidth = 0.5
		const descendMetric = new FontMetric(renderProps.font_descend!, 1.9)
		const descendTextField = 1.5 * descendMetric.fontSize * descendMetric.fontScale

		const leftText = result.scoreProps.descendText.left?.text ?? ''
		const rightText = result.scoreProps.descendText.right?.text ?? I18n.renderToken(lng, 'page')
		const hasDescend = !!(leftText || rightText)

		const uniformWidth = 1
		const uniformHeight = renderProps.page!
		const innerRatio = (uniformHeight - uniformWidth * 0.08 * 2) / (
			uniformWidth * 1 * (
				100 / (100 + pageMarginX[0] + pageMarginX[1])
			)
		)
		const descendExtraMargin = (+hasDescend) * descendTextField * scale * 0.3  // 0.3 是有意为之的调整参数
		const maxHeightEm = innerRatio * 100 - (+hasDescend) * descendTextField * scale * (1) - descendExtraMargin

		if(uniformHeight == 0) { // 不启用程序分页
			return {
				result: fields,
				pages: NaN
			}
		}

		// 初步分页
		const pageFields: EquifieldSection[][] = []
		let frontier: EquifieldSection[] = []
		let currHeight = Infinity
		let isFirst = true
		for(let field of [...fields, null]) {
			if(field === null || field.height + currHeight > maxHeightEm) {
				// 开启新的页面
				pageFields.push(frontier = [])
				currHeight = 0
				isFirst = true
			}
			if(field === null) {
				break
			}
			currHeight += field.height
			if(!isFirst || !field.isMargin) {
				frontier.push(field)
				isFirst = false
			}
		}

		// 删除每页末尾空白
		for(let page of pageFields) {
			while(page.length > 0) {
				const lastField = page[page.length - 1]
				if(lastField.isMargin) {
					page.splice(page.length - 1, 1)
				} else {
					break
				}
			}
		}

		// 删除末尾空白页，太讨厌了！
		while(pageFields.length > 0) {
			const lastPage = pageFields[pageFields.length - 1]
			if(lastPage.length == 0) {
				pageFields.splice(pageFields.length - 1, 1)
			} else {
				break
			}
		}

		// 渲染页面并添加空白和页脚
		const newFields: EquifieldSection[] = []
		const pages = pageFields.length
		for(let page = 0; page < pages; page++) {
			const pageNumber = page + 1
			const isLastPage = pageNumber == pages
			const inverseLeftRight = doubleSided && (page % 2 == 1)  // 这表示偶数页码
			function realPagePadding(pagePadding: [number, number] | undefined): [number, number] | undefined {
				if(pagePadding == undefined) {
					return undefined
				}
				if(inverseLeftRight) {
					return [pagePadding[1], pagePadding[0]]
				}
				return pagePadding
			}

			let originalHeight = 0
			let emptyCount = 0
			let doneHeight = 0

			// 统计总高度
			for(let field of pageFields[page]) {
				originalHeight += field.height
				if(field.isMargin) {
					emptyCount += 1
				}
			}
			let lackHeight = maxHeightEm - originalHeight

			// 推入内容
			for(let field of pageFields[page]) {
				let height = field.height
				if(!isLastPage && field.isMargin) {  // 最后一页不使用空白分布，不然...
					height += lackHeight / (emptyCount + (+hasDescend) * 0.5)  // 最后一项是调节参数
				}
				newFields.push({
					...field,
					height: height,
					breakAfter: 'avoid',
					padding: realPagePadding(field.padding)
				})
				doneHeight += height
			}

			// 创建页面底部边距
			newFields.push({
				element: new DomPaint().getElement(),
				height: maxHeightEm - doneHeight + descendExtraMargin,
				breakAfter: hasDescend ? 'avoid' : 'always',
				isMargin: true,
				padding: realPagePadding(pageMarginX),
				...I18n.efLabel(lng, 'pageBottomMargin')
			})
			// 创建页脚
			if(hasDescend) {
				const descendPaint = new DomPaint()
				descendPaint.drawTextFast(
					0, descendTextField / 2,
					getLanguageValue(inverseLeftRight ? rightText : leftText, pageNumber.toString(), pages.toString()),
					descendMetric, scale,
					'left', 'middle'
				)
				descendPaint.drawTextFast(
					100, descendTextField / 2,
					getLanguageValue(inverseLeftRight ? leftText : rightText, pageNumber.toString(), pages.toString()),
					descendMetric, scale,
					'right', 'middle'
				)
				newFields.push({
					element: descendPaint.getElement(),
					height: descendTextField * scale,
					breakAfter: 'always',
					padding: realPagePadding(pageMarginX),
					...I18n.efLabel(lng, 'pageDescend', pageNumber.toString())
				})
			}
			// 创建页面分割线
			const separatorPaint = new DomPaint()
			separatorPaint.drawLine(-5, separatorField / 2, 105, separatorField / 2, separatorWidth, 0, scale, {opacity: 0.125})
			/* TODO[yezhiyi9670]: Make this less breaking */
			separatorPaint.htmlContent += `<style>
				@media print { @page { margin-bottom: 0 !important; } } 
			</style>`
			newFields.push({
				element: separatorPaint.getElement(),
				height: separatorField * scale,
				isMargin: true,
				padding: realPagePadding(pageMarginX),
				...I18n.efLabel(lng, 'pageSeparator')
			})
		}

		return {
			result: newFields,
			pages: pages
		}
	}
}

export const Paginizer = new PaginizerClass()
