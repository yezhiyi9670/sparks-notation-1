import { NMNResult } from "../.."
import { DomPaint } from "../backend/DomPaint"
import { RenderContext } from "../renderer"
import { FontMetric } from "../FontMetric"
import { I18n } from "../../i18n"
import { MusicPaint } from "../paint/MusicPaint"
import { PaintTextToken } from "../paint/PaintTextToken"
import { EquifieldSection } from "../../equifield/equifield"
import { AlignedTextEntry, AlignedTextRenderer } from "../text/AlignedTextRenderer"

class HeaderRendererClass {
	renderTop(score: NMNResult['result'], sections: EquifieldSection[], context: RenderContext) {
		const root = new DomPaint()
		const scale = context.render.scale!
		let currY = 0

		const hasTitleLines = !!(score.scoreProps.title || score.scoreProps.subtitle)
		const hasCornerLines = !!(score.scoreProps.prescript || score.scoreProps.version)

		// 角标题
		const cornerMetric = new FontMetric(context.render.font_corner!, 2.0)
		if(score.scoreProps.prescript) {
			root.drawTextFast(0, currY, score.scoreProps.prescript.text, cornerMetric, scale, 'left')
		}
		if(score.scoreProps.version) {
			root.drawTextFast(100, currY, score.scoreProps.version.text, cornerMetric, scale, 'right')
		}
		currY += 2
		
		if(hasTitleLines) {
			currY += 4
		}

		// 大标题
		if(score.scoreProps.title) {
			const titleMetric = new FontMetric(context.render.font_title!, 3.5)
			root.drawTextFast(50, currY, score.scoreProps.title.text, titleMetric, scale, 'center')
			currY += 1.25 + 3.5 * titleMetric.fontScale
		}
		// 副标题
		if(score.scoreProps.subtitle) {
			const titleMetric = new FontMetric(context.render.font_subtitle!, 2.3)
			root.drawTextFast(50, currY, score.scoreProps.subtitle.text, titleMetric, scale, 'center')
			currY += 1.25 + 2.3 * titleMetric.fontScale
		}

		if(hasCornerLines || hasTitleLines) {
			currY += 2.5
			sections.push({
				element: root.getElement(),
				height: currY * scale,
				...I18n.efLabel(context.language, 'top')
			})
		} else {
			sections.push({
				element: root.getElement(),
				height: currY * scale,
				...I18n.efLabel(context.language, 'topPrintMargin')
			})
		}
	}
	renderPropsAndAuthors(score: NMNResult['result'], sections: EquifieldSection[], context: RenderContext) {
		const root = new DomPaint()
		const msp = new MusicPaint(root)
		const scale = context.render.scale!
		let currY = 0

		// 作者
		score.scoreProps.authors.map((author) => {
			const authorMetric = new FontMetric(context.render.font_author!, 2.16)
			let text = author.text
			if(author.tag) {
				text = author.text + I18n.renderToken(context.language, 'author_sep') + author.tag
			}
			root.drawTextFast(100, currY, text, authorMetric, scale, 'right')
			currY += 1.2 + 2.16 * authorMetric.fontScale
		})

		if(score.musicalProps && score.musicalProps.head as string != 'Pi') {
			currY += 1
			const propsThreshold = 4.8
			if(currY < propsThreshold + 1) {
				currY = 2
			} else {
				currY -= propsThreshold
			}

			currY += propsThreshold / 2

			// 音乐属性
			;((musicalProps) => {
				msp.drawMusicalProps(context, true, 0, currY, musicalProps, 1, scale)
			})(score.musicalProps.props)

			currY += propsThreshold / 2

			currY -= 1
		}

		currY += 2
		sections.push({
			element: root.getElement(),
			height: currY * scale,
			...I18n.efLabel(context.language, 'author')
		})
	}
	renderTopSpacer(score: NMNResult['result'], sections: EquifieldSection[], context: RenderContext) {
		sections.push({
			element: new DomPaint().getElement(),
			height: context.render.margin_after_props! * context.render.scale!,
			...I18n.efLabel(context.language, 'topMargin')
		})
	}
	renderFooter(score: NMNResult['result'], sections: EquifieldSection[], context: RenderContext) {
		const root = new DomPaint()
		const scale = context.render.scale!
		let currY = 0

		const textMetric = new FontMetric(context.render.font_footnote!, 2.0)
		const entries: AlignedTextEntry[] = score.scoreProps.footnotes.map(item => {
			if(item.tag) {
				return {
					text1: '[' + item.tag + '] ',
					text2: item.text
				}
			} else {
				return {
					text1: item.text,
					text2: null
				}
			}
		})

		currY += AlignedTextRenderer.renderEntries(entries, textMetric, root, context, currY)

		if(score.scoreProps.footnotes.length > 0) {
			sections.push({
				element: root.getElement(),
				height: currY * scale,
				...I18n.efLabel(context.language, 'footer')
			})
		}
	}
}

export const HeaderRenderer = new HeaderRendererClass()
