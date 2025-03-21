import { inCheck } from "@sparks-notation/util/array"

/**
 * 渲染属性
 */
export interface RenderProps {
	/**
	 * 页面高度与宽度之比
	 */
	page?: number
	/**
	 * 假设双面打印
	 */
	double_sided?: boolean
	/**
	 * 页面左右边距
	 */
	page_margin_x?: [number, number],
	/**
	 * 每行小节数
	 */
	n?: number
	/**
	 * 基于时值的小节宽度
	 */
	time_lining?: boolean
	/**
	 * 按音符数微调小节宽度
	 */
	note_count_lining?: boolean
	/**
	 * 使用旧版布局算法
	 */
	legacy_positioning?: boolean
	/**
	 * 调试模式
	 */
	debug?: boolean
	/**
	 * 小节序号
	 */
	sectionorder?: string
	/**
	 * 尺寸
	 */
	scale?: number
	/**
	 * 声部渲染左边距
	 */
	gutter_left?: number
	/**
	 * 连谱号渲染左边距
	 */
	connector_left?: number
	/**
	 * 渲染每声部起始小节的小节线
	 */
	left_separator?: boolean
	/**
	 * 延长连音线灰色提示
	 */
	grayout?: boolean
	/**
	 * 显示所有声部标记和歌词行标记
	 */
	explicitmarkers?: boolean
	/**
	 * 字体 - 小节序号
	 */
	font_sectionorder?: string
	/**
	 * 字体-声部文本
	 */
	font_part?: string
	/**
	 * 字体-文段标题
	 */
	font_article?: string
	/**
	 * 字体-标题
	 */
	font_title?: string
	/**
	 * 字体-副标题
	 */
	font_subtitle?: string
	/**
	 * 字体-作者
	 */
	font_author?: string
	/**
	 * 字体-角落
	 */
	font_corner?: string
	/**
	 * 字体-文本
	 */
	font_text?: string
	/**
	 * 字体-尾注
	 */
	font_footnote?: string
	/**
	 * 字体-页脚
	 */
	font_descend?: string
	/**
	 * 字体-文本标记
	 */
	font_attr?: string
	font_force?: string
	font_chord?: string
	font_annotation0?: string
	font_annotation1?: string
	font_annotation2?: string
	font_annotation3?: string
	font_annotation4?: string
	font_annotation5?: string
	font_annotation6?: string
	/**
	 * 字体-歌词
	 */
	font_lyrics?: string
	/**
	 * 字体-段落标记
	 */
	font_checkpoint?: string
	/**
	 * 音乐作者与全局属性之后的间距
	 */
	margin_after_props?: number
	/**
	 * 章节后的间距
	 */
	margin_after_article?: number
	/**
	 * 章节标题后的间距
	 */
	margin_after_header?: number
	/**
	 * 文本章节标题的额外间距
	 */
	margin_after_header_text?: number
	/**
	 * 乐谱行前的间距
	 */
	margin_before_line?: number
	/**
	 * 乐谱行后的间距
	 */
	margin_after_line?: number
	/**
	 * 声部曲谱部分前的间距
	 */
	margin_between_parts?: number
	/**
	 * 声部曲谱部分后的间距
	 */
	margin_after_part_notes?: number
	/**
	 * 声部歌词组前的负间距
	 */
	inset_before_lyrics?: number
	/**
	 * 声部歌词组后的间距
	 */
	margin_after_lyrics?: number
	/**
	 * 声部后的间距
	 */
	margin_after_part?: number
	/**
	 * 歌词行反复次数与歌词的间距
	 */
	offset_lyrics_iter?: number
	/**
	 * 小节间距
	 */
	offset_section_boundary?: number
}

/**
 * 默认渲染属性
 */
export const renderPropsDefault: RenderProps = {
	page: 0,
	double_sided: false,
	page_margin_x: [11, 11],
	n: 4,
	time_lining: false,
	note_count_lining: false,
	legacy_positioning: false,
	debug: true,
	sectionorder: 'paren',
	scale: 1.0,
	gutter_left: 1,
	connector_left: 0,
	left_separator: false,
	grayout: false,
	explicitmarkers: true,
	font_sectionorder: 'CommonLight/400',
	font_part: 'Roman,CommonSerif/700',
	font_article: 'Roman,CommonSerif/700',
	font_title: 'Roman,CommonSerif/700',
	font_subtitle: 'CommonSerif/400',
	font_author: 'CommonSerif/400',
	font_corner: 'CommonLight/400',
	font_text: 'Roman,CommonSerif/400',
	font_footnote: 'CommonSerif/400',
	font_descend: 'CommonLight/400',
	font_attr: 'CommonSerif/400',
	font_force: 'RomanItalic,CommonBlack/400',
	font_chord: 'Roman/600',
	font_annotation0: 'CommonSerif/600',
	font_annotation1: 'CommonSerif/600',
	font_annotation2: 'CommonSerif/600',
	font_annotation3: 'CommonSerif/600',
	font_annotation4: 'CommonSerif/600',
	font_annotation5: 'CommonSerif/600',
	font_annotation6: 'CommonSerif/600',
	font_lyrics: 'Roman,CommonSerif/600',
	font_checkpoint: 'Roman,CommonSerif/700',
	margin_after_props: 2,
	margin_after_article: 1.5,
	margin_after_header: 0.8, // diff 1
	margin_after_header_text: 0.7,
	margin_before_line: 1.2, // diff 1.7
	margin_after_line: 0.1, // diff 1.1
	margin_between_parts: 2.5,
	margin_after_part_notes: 2,
	inset_before_lyrics: 1.3,
	margin_after_lyrics: 0.1,
	margin_after_part: 1,
	offset_lyrics_iter: 1.5,
	offset_section_boundary: 1,
}

/**
 * 仅允许文档级使用的属性
 */
export const renderPropsDocumentOnlyKeys = ['page', 'double_sided', 'page_margin_x']
/**
 * 碎片级仅支持以下属性属性
 */
export const renderPropsFragmentLevelExclusiveKeys = ['n', 'time_lining']

/**
 * 验证并转换属性
 */
export function renderPropConvert(key: string, val: string) {
	if(key == 'page') {
		let r = +val
		if(val.indexOf('/') != -1) { // 输入长宽自动计算
			let splitVal = val.split('/')
			if(splitVal.length == 2) {
				r = (+splitVal[0]) / +splitVal[1]
			}
		}
		if(['A0', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6'].includes(val.toUpperCase())) {
			r = 1.4142
		}
		if(['B3', 'B4', 'B5'].includes(val.toUpperCase())) {
			r = 1.4157
		}
		if(r >= 0 && r <= 65535) {
			return r
		}
		return { error: 'value' }
	}
	if(key == 'page_margin_x') {
		let s = val.split(',')
		if(s.length != 2 && s.length != 1) {
			return { error: 'value' }
		}
		const nums = s.map(v => +v)
		if(s.length == 1 && nums[0] >= 0 && nums[0] <= 65535) {
			return [ nums[0], nums[0] ]
		}
		if(nums[0] >= 0 && nums[0] <= 65535 && nums[1] >= 0 && nums[1] <= 65535) {
			return nums
		}
		return { error: 'value' }
	}
	if(key == 'n') {
		let r = +val
		if(Math.floor(r) == r && r >= 1 && r <= 65535) {
			return r
		}
		return { error: 'value' }
	}
	if([
		'time_lining', 'note_count_lining',
		'debug', 'grayout', 'explicitmarkers', 'left_separator', 'double_sided', 'legacy_positioning'
	].includes(key)) {
		if(val == 'true') {
			return true
		}
		if(val == 'false') {
			return false
		}
		return { error: 'value' }
	}
	if(key == 'sectionorder') {
		if(['none', 'plain', 'paren', 'bracket'].indexOf(val) != -1) {
			return val
		}
		return { error: 'value' }
	}
	if(
		key == 'scale' || key == 'gutter_left' || key == 'connector_left'
		|| key.startsWith('margin_') || key.startsWith('inset_') || key.startsWith('offset_')
	) {
		let num = +val
		if(num != num || num < 0 || num >= 65536) {
			return { error: 'value' }
		}
		return num
	}
	if(inCheck(key, renderPropsDefault)) {
		return val
	}
	return { error: 'key' }
}
