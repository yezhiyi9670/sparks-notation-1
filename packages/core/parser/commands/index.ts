import { findWithKey } from "@sparks-notation/util/array"

export interface CommandDef {
	/**
	 * 命令头缩写
	 */
	head: string
	/**
	 * 命令头全称
	 */
	headFull: string
	/**
	 * 内容处理方式
	 * - `none` 无内容
	 * - `text` 作为文本整体处理
	 * - `separated` 作为文本以空格分隔处理
	 * - `tokenized` 作为代码按单词处理
	 */
	contentType: 'none' | 'text' | 'separated' | 'tokenized'
	/**
	 * 是否有属性
	 * - `none` 不能有属性
	 * - `optional` 可以有，也可以没有
	 * - `required` 必须有属性
	 */
	hasProps: 'none' | 'optional' | 'required'
	/**
	 * 属性处理方式
	 * - `none` 无属性
	 * - `text` 作为文本整体处理
	 * - `single` 一个属性
	 * - `multiple` 多个属性
	 */
	propsType: 'none' | 'text' | 'single' | 'multiple'
	/**
	 * 特殊形（Text）
	 */
	special?: boolean | 'none'
	/**
	 * 当前级别内必须（属性值指定组名，相同组的只需要有一个即满足要求）
	 */
	required?: string
	/**
	 * 当前级别内不允许重复（属性值指定组名，相同组内不允许重复，即使命令名不同）
	 */
	unique?: string
	/**
	 * 级别
	 */
	levels: number[]
	/**
	 * 是否允许在非头部出现
	 */
	allowTail?: boolean
}

export const LineLevels = {
	document: 0,
	article: 1,
	fragment: 2,
	part: 3,
	lyricLine: 4
}
export const lineLevelNames = [
	// 由于历史遗留问题，章节 (article) 在 Sparks NMN 代码的命令名中称为 section。
	// 代码其余地方的 section 指的应该是「小节」或者渲染时的「块」。
	'document', 'article', 'fragment', 'part', 'lyricLine'
]
export const lineDelimiters = [
	undefined, '=', '-', undefined, undefined
]

/**
 * 根据指令头获取其定义
 */
export function getCommandDef(head: string) {
	return (
		findWithKey(commandDefs, 'head', head) ??
		findWithKey(commandDefs, 'headFull', head) ??
		undefined
	)
}

/**
 * 获取指令头最近的等级
 */
export function getCommandNearestLevel(def: CommandDef, level: number) {
	// 首先你不可以没有等级
	// 其次，等级占据应该是连续的，所以不会出现两个等级距离相等且都是最近
	return def.levels.slice().sort((a, b) => Math.abs(a - level) - Math.abs(b - level))[0]
}

export const commandDefs: CommandDef[] = [
	// Dt 文档标题
	{
		head: 'Dt',
		headFull: 'DocTitle',
		contentType: 'text',
		hasProps: 'none',
		propsType: 'none',
		unique: 'Dt',
		levels: [LineLevels.document]
	},
	// Dp 文档标题顶部，左上角
	{
		head: 'Dp',
		headFull: 'DocPrescript',
		contentType: 'text',
		hasProps: 'none',
		propsType: 'none',
		unique: 'Dp',
		levels: [LineLevels.document]
	},
	// Dv 文档标题顶部，右上角（版本号）
	{
		head: 'Dv',
		headFull: 'DocVersion',
		contentType: 'text',
		hasProps: 'none',
		propsType: 'none',
		unique: 'Dv',
		levels: [LineLevels.document]
	},
	// Ds 文档副标题
	{
		head: 'Ds',
		headFull: 'DocSubtitle',
		contentType: 'text',
		hasProps: 'none',
		propsType: 'none',
		unique: 'Ds',
		levels: [LineLevels.document]
	},
	// Da 作者
	{
		head: 'Da',
		headFull: 'DocAuthor',
		contentType: 'text',
		hasProps: 'optional',
		propsType: 'text',
		levels: [LineLevels.document]
	},
	// Df 文档尾注
	{
		head: 'Df',
		headFull: 'DocFootnote',
		contentType: 'text',
		hasProps: 'optional',
		propsType: 'text',
		levels: [LineLevels.document],
		allowTail: true
	},
	// Dl 页脚左侧文本
	{
		head: 'Dl',
		headFull: 'DescenderLeft',
		contentType: 'text',
		hasProps: 'none',
		propsType: 'none',
		unique: 'Dl',
		levels: [LineLevels.document]
	},
	// Dr 页脚右侧文本
	{
		head: 'Dr',
		headFull: 'DescenderRight',
		contentType: 'text',
		hasProps: 'none',
		propsType: 'none',
		unique: 'Dr',
		levels: [LineLevels.document]
	},
	// P 全文乐理属性
	{
		head: 'P',
		headFull: 'Props',
		contentType: 'separated',
		hasProps: 'none',
		propsType: 'none',
		required: 'P',
		unique: 'P',
		levels: [LineLevels.document]
	},
	// Pi 全文(隐)乐理属性
	{
		head: 'Pi',
		headFull: 'PropsImplicit',
		contentType: 'separated',
		hasProps: 'none',
		propsType: 'none',
		required: 'P',
		unique: 'P',
		levels: [LineLevels.document]
	},
	// Rp 全文渲染属性
	{
		head: 'Rp',
		headFull: 'RenderProps',
		contentType: 'separated',
		hasProps: 'none',
		propsType: 'none',
		levels: [LineLevels.document]
	},
	// T 文本标注
	{
		head: 'T',
		headFull: 'Text',
		contentType: 'text',
		hasProps: 'none',
		propsType: 'none',
		levels: [LineLevels.article],
		special: true
	},
	// S Article 标题
	{
		head: 'S',
		headFull: 'Section',
		contentType: 'text',
		hasProps: 'none',
		propsType: 'none',
		unique: 'S',
		levels: [LineLevels.article],
		special: 'none'
	},
	// Srp Article 渲染属性
	{
		head: 'Srp',
		headFull: 'SectionRenderProps',
		contentType: 'text',
		hasProps: 'none',
		propsType: 'none',
		levels: [LineLevels.article],
		special: 'none'
	},
	// Sp Article 乐理属性
	{
		head: 'Sp',
		headFull: 'SectionProps',
		contentType: 'separated',
		hasProps: 'none',
		propsType: 'none',
		unique: 'Sp',
		levels: [LineLevels.article],
	},
	// B Fragment 前强制换行
	{
		head: 'B',
		headFull: 'Break',
		contentType: 'none',
		hasProps: 'none',
		propsType: 'none',
		unique: 'B',
		levels: [LineLevels.fragment]
	},
	// J Fragment 跳房子
	{
		head: 'J',
		headFull: 'Jumper',
		contentType: 'tokenized',
		hasProps: 'none',
		propsType: 'none',
		unique: 'J',
		levels: [LineLevels.fragment]
	},
	// Frp Fragment 渲染属性
	{
		head: 'Frp',
		headFull: 'FragmentRenderProps',
		contentType: 'separated',
		hasProps: 'none',
		propsType: 'none',
		levels: [LineLevels.fragment]
	},
	// N 音符
	{
		head: 'N',
		headFull: 'Notes',
		contentType: 'tokenized',
		hasProps: 'optional',
		propsType: 'multiple',
		unique: 'N',
		required: 'N',
		levels: [LineLevels.part]
	},
	// Na 鼓点音符
	{
		head: 'Na',
		headFull: 'NotesAccompany',
		contentType: 'tokenized',
		hasProps: 'optional',
		propsType: 'multiple',
		unique: 'N',
		required: 'N',
		levels: [LineLevels.part]
	},
	// Nc 压行音符
	{
		head: 'Nc',
		headFull: 'NotesCompact',
		contentType: 'tokenized',
		hasProps: 'optional',
		propsType: 'multiple',
		unique: 'N',
		required: 'N',
		levels: [LineLevels.part]
	},
	// L 手动分割歌词
	{
		head: 'L',
		headFull: 'Lyric',
		contentType: 'tokenized',
		hasProps: 'optional',
		propsType: 'multiple',
		unique: 'L',
		required: 'L',
		levels: [LineLevels.lyricLine]
	},
	// Lc 字基歌词
	{
		head: 'Lc',
		headFull: 'LyricChar',
		contentType: 'tokenized',
		hasProps: 'optional',
		propsType: 'multiple',
		unique: 'L',
		required: 'L',
		levels: [LineLevels.lyricLine]
	},
	// Lw 词基歌词
	{
		head: 'Lw',
		headFull: 'LyricWord',
		contentType: 'tokenized',
		hasProps: 'optional',
		propsType: 'multiple',
		unique: 'L',
		required: 'L',
		levels: [LineLevels.lyricLine]
	},
	// Ns 替代音符
	{
		head: 'Ns',
		headFull: 'NotesSubstitute',
		contentType: 'tokenized',
		hasProps: 'optional',
		propsType: 'multiple',
		levels: [LineLevels.lyricLine]
	},
	// A 标记记号
	{
		head: 'A',
		headFull: 'Annotation',
		contentType: 'tokenized',
		hasProps: 'optional',
		propsType: 'text',
		levels: [LineLevels.part, LineLevels.lyricLine]
	},
	// La 歌词标记
	{
		head: 'La',
		headFull: 'LyricAnnotation',
		contentType: 'tokenized',
		hasProps: 'none',
		propsType: 'none',
		unique: 'La',
		levels: [LineLevels.lyricLine]
	}
]
