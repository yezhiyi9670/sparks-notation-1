import { FontMetric } from "../../../FontMetric";
import { RenderProps } from "../../../props";
import { RenderContext } from "../../../renderer";

const smallNoteScale = 0.9           // 用于替代旋律
const noteAltScale = 1               // 用于特殊音符字符 `_`，不影响测量
export const addNotesScale = 0.65    // 装饰音

const LineFonts: {[_: string]: FontMetric | ((_: RenderProps) => FontMetric)} = {
	note: () => new FontMetric('SparksNMN-EOPNumber/400', 2.4),
	noteAlt: () => new FontMetric('CommonBlack/700', 2.4 * noteAltScale),
	
	noteSmall: () => new FontMetric('SparksNMN-EOPNumber/400', 2.4 * smallNoteScale),
	noteAltSmall: () => new FontMetric('CommonBlack/700', 2.4 * smallNoteScale * noteAltScale),
	
	accidental: () => new FontMetric('SparksNMN-mscore-20', 2.2),
	accidentalSmall: () => new FontMetric('SparksNMN-mscore-20', 2.2 * smallNoteScale),

	lyrics: (prop) => new FontMetric(prop.font_lyrics!, 2.16)
}

export const reductionLineSpace = 0.5
export const topDecorSpace = 1.2

export function getLineFont(key: string, context: RenderContext) {
	const ret = LineFonts[key]
	if(ret === undefined) {
		throw new Error('Line font ' + key + ' does not exist!')
	}
	if(typeof ret == 'function') {
		return ret(context.render)
	}
	return ret
}
