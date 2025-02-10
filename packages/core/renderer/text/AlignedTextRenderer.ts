import { DomPaint } from "../backend/DomPaint"
import { FontMetric } from "../FontMetric"
import { PaintTextToken } from "../paint/PaintTextToken"
import { RenderContext } from "../renderer"

// 渲染含有单个对齐点的文段
class AlignedTextRendererClass {

  renderEntries(entries: AlignedTextEntry[], textMetric: FontMetric, root: DomPaint, context: RenderContext, startY: number) {
    let currY = startY
    const scale = context.render.scale!

    const textSize = textMetric.fontSize * textMetric.fontScale * scale

    function createTextToken<T extends {}>(text: string, extraStyles: T) {
      return new PaintTextToken(text, textMetric, scale, {
				width: `${100 / textSize}em`,
				whiteSpace: 'pre-wrap',
        ...extraStyles
			})
    }

    // 确定对齐点之前的部分的最大宽度
    let maxPrefixWidth = 0
    for(let entry of entries) {
      if(entry.text2 == null) {
        continue
      }
      const textToken = createTextToken(entry.text1, {})
      maxPrefixWidth = Math.max(maxPrefixWidth, textToken.measureFast(root)[0])
    }
    maxPrefixWidth = Math.min(maxPrefixWidth, 100)

    // 实际渲染
    const lineHeight = 1.2
		for(let entry of entries) {
      let rectText1 = entry.text1
      if(rectText1 == '') {
        rectText1 = ' '
      }
      if(entry.text2 == null) {
        // 贴靠左侧渲染文本
        const textToken = createTextToken(rectText1, {})
        currY += textToken.draw(root, 0, currY, 'left', 'top')[1] * lineHeight
      } else {
        // 根据对齐点渲染文本
        const textToken1 = new PaintTextToken(rectText1, textMetric, scale)
        const height1 = textToken1.draw(root, maxPrefixWidth, currY, 'right', 'top')[1] * lineHeight
        const textToken2 = createTextToken(entry.text2, {
          width: `${(100 - maxPrefixWidth) / textSize}em`,
          whiteSpace: 'pre-wrap',
        })
        const height2 = textToken2.draw(root, maxPrefixWidth, currY, 'left', 'top')[1] * lineHeight
        currY += Math.max(height1, height2)
      }
		}

    return currY - startY
  }

}

export type AlignedTextEntry = {
  text1: string,
  text2: string | null
}

export const AlignedTextRenderer = new AlignedTextRendererClass()
