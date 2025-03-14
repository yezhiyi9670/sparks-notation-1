import { RenderProps } from "../../renderer/props"
import { Fraction } from "@sparks-notation/util/frac"

export type Beats = {
	value: {
		x: number,
		y: number
	}
	component?: { x: number, y: number }[]  // 不规则拍号解析式
	defaultReduction: number  // 一阶分划点的默认分割数
	swing: 'none' | '8th' | '16th'  // 是否使用摇摆节奏
}

export type Qpm = {
	value: number
	symbol: 'hpm' | 'h.pm' | 'qpm' | 'q.pm' | 'spm' | 's.pm'
	text?: string
}

export type BaseTune = {
	value: number
	baseValue: number
	explicitOctave: boolean
}

export type MusicProps = {
	beats?: Beats
	qpm?: Qpm
	base?: BaseTune                  // 基调
	transp?: number                  // 对于乐器的移调量，用于适用绝对音高的标记（例如和弦）
	extras: string[]                 // 其他字符串
}

/**
 * 迭代数属性（形如：1., 2., 3.）
 * 
 * 用于小节线时，只能出现在前标记或者后标记上，其中前标记对应 :|| 符号，后标记对应 ||: 符号。
 */
export type AttrIter = {
	type: 'iter'
	iter: number
}
/**
 * 重置迭代数
 */
export type AttrReset = {
	type: 'reset'
}
/**
 * 小节的布局权重属性
 */
export type AttrWeight = {
	type: 'weight'
	weight: number
}
/**
 * 小节的属性上边界
 */
export type AttrTop = {
	type: 'top'
	margin: number
}
/**
 * 小节的额外水平边距
 */
export type AttrPadding = {
	type: 'padding'
	padding: number
}
/**
 * 开放区间属性
 * 
 * 用在小节线属性上，表示属性渲染时强制换行
 */
export type AttrOpenRange = {
	type: 'openRange'
}
/**
 * 文本标记属性（形如："text"）
 */
export type AttrText = {
	type: 'text'
	text: string
}
/**
 * 升降八度（形如：8va, 8vb）
 */
export type AttrOctave = {
	type: 'octave'
	sign: -1 | 1
}
/**
 * 段落反复标记（形如：D.S., Fine.）
 */
export type AttrRepeat = {
	type: 'repeat'
	char: 'D.S.' | 'D.C.' | 'Fine.' | '$' | '@'
}
/**
 * 拍号（形如：3/4, 5/4T=3/4+2/4）
 */
export type AttrBeats = {
	type: 'beats'
	beats: Beats
}
/**
 * 转调（已知目标基音或已知差值，形如：1=#C, 1T=E, d1=2, d1T=5th）
 */
export type AttrShift = {
	type: 'shift'
	metrics: 'absolute'
	value: BaseTune
	changeTranspose: boolean
} | {
	type: 'shift'
	metrics: 'key' | 'thd' | 'thm' | 'th' | 'tha'
	value: number
	changeTranspose: boolean
}
/**
 * 改变节拍（形如：qpm=225, spm=216/快板）
 */
export type AttrQpm = {
	type: 'qpm'
	qpm: Qpm
}
/**
 * 反复记号耐久度
 */
export type AttrDurability = {
	type: 'durability'
	value: number
}
/**
 * 小节线段落标记
 */
export type AttrLabel = {
	type: 'label'
	label: AttrText | AttrScriptedText
}
/**
 * 音符上方装饰符
 */
export type AttrDecor = {
	type: 'decor'
	char: string
	priority: number
}
export const attrDecorCheck = {
	'tr': 1, 'tr+': 1, 'wav': 1, 'wav+': 1, 'wavd': 1, 'wavd+': 1,
	'echo': 1, 'recho': 1, 'ext': 1, 'hold': 1, 'str': 1,
	'brk': 1, 'tip': 1
}
/**
 * 音符上方装饰符的优先级
 */
export function attrDecorPriority(char: string) {
	if(['hold', 'str', 'brk', 'tip'].indexOf(char) != -1) {
		return 2
	}
	if(char == 'ext') {
		return 3
	}
	return 1
}
/**
 * 装饰音
 */
export type AttrNotes = {
	type: 'notes'
	slot: 'prefix' | 'postfix'
	notes: MusicSection<NoteCharMusic>
}
/**
 * 滑音符号
 */
export type AttrSlide = {
	type: 'slide'
	direction: 'up' | 'down'
}
/**
 * 位移符号
 * 写法：delta(-3)
 */
export type AttrDelta = {
	type: 'delta'
	value: number
}
/**
 * 插入符号
 */
export type AttrInsert = {
	type: 'insert'
	char: string
}
export const attrInsertCharCheck = {
	'rpr': 1,
	'lpr': 3,
	'int': 2,
	'cas': 2
}
/**
 * 插入符号的优先级
 */
export function attrInsertPriority(char: string) {
	if(char == 'rpr') {
		return 1
	}
	if(char == 'lpr') {
		return 3
	}
	return 2
}
/**
 * 带有下标的文本
 */
export type AttrScriptedText = {
	type: 'scriptedText'
	text: string
	sub: string
}

/**
 * 跳房子区间的属性
 */
export type JumperAttr =
	AttrIter |
	AttrOctave |
	AttrText |
	AttrScriptedText
/**
 * 小节线的属性
 */
export type SeparatorAttr = {
	/**
	 * 字符区间
	 */
	range: [number, number]
} & SeparatorAttrBase
export type SeparatorAttrBase =
	AttrIter |
	AttrReset |
	AttrWeight |
	AttrTop |
	AttrPadding |
	AttrRepeat |
	AttrOpenRange |
	AttrQpm |
	AttrBeats |
	AttrShift |
	AttrDurability |
	AttrText |
	AttrScriptedText |
	AttrLabel
/**
 * 小节线属性的可用位置
 */
export const separatorAttrPosition: {
	[_: string]: [boolean, boolean, boolean, 'begin' | 'end'] // 前(pre/after)-中(next)-后(post/before)-禁止上方属性的位置
} = {
	weight: [false, false, true, 'begin'],
	top: [false, false, true, 'begin'],
	padding: [false, false, true, 'begin'],
	
	iter: [true, false, true, 'begin'],
	reset: [true, true, true, 'end'],
	durability: [true, false, false, 'begin'],
	repeat: [true, true, true, 'begin'],
	
	qpm: [true, true, true, 'end'],
	beats: [true, true, true, 'end'],
	shift: [true, true, true, 'end'],

	text: [true, true, true, 'begin'],
	scriptedText: [true, true, true, 'begin'],
	label: [true, false, true, 'begin'],

	openRange: [true, false, true, 'begin']
}
/**
 * 音符的属性
 */
export type NoteAttr =
	AttrDecor |
	AttrNotes |
	AttrSlide |
	AttrDelta
/**
 * 插入符号
 */
export type InsertSymbol = AttrInsert
/**
 * 声部属性
 */
export type PartAttr =
	AttrText |
	AttrScriptedText
/**
 * 替代音符、歌词属性
 */
export type LrcAttr =
	AttrIter |
	AttrText |
	AttrScriptedText

export type LyricDestructionType = 'manual' | 'char' | 'word'
/**
 * 歌词字符
 */
export type LyricChar = {
	/**
	 * 文本
	 */
	text: string
	/**
	 * 是否占据位置
	 */
	occupiesSpace: boolean
	/**
	 * 通过小括号添加下划线
	 */
	grouped: boolean
	/**
	 * 前缀符号
	 */
	prefix: string
	/**
	 * 后缀符号
	 */
	postfix: string
	/**
	 * 角色前缀
	 */
	rolePrefix?: string
	/**
	 * 绘制延长线（如果这个位置上就是延长线，则此项为 true，文本为空）
	 *
	 * 仅对占据位置的字符有效。
	 *
	 * 延长线的形态是下划线字符“_”，不是连字符，以免混淆。显然这玩意不需要跨片段联合。
	 */
	extension: boolean
	/**
	 * 是否为字基
	 */
	isCharBased: boolean
}

/**
 * 小节分隔线的描述符
 * 
 * 注：描述符中包含 `/`，则这是隐藏小节线或含虚线的小节线，前一个小节可以不填满。
 */
export type SectionSeparatorChar = '/' | '/|' | '|' | '||' | '|||' | '||:' | ':||' | ':||:' | '/||' | ':/||' | '/||:' | ':/||:'
/**
 * 小节线在行末/行首如何拆分显示，以及它们允许的位置
 */
export const sectionSeparatorCharMap: {
	[_: string]: [SectionSeparatorChar, SectionSeparatorChar, boolean, boolean, boolean] // 前-中-后
} = {
	'/': ['/', '/', true, true, true],
	'/|': ['/|', '/', false, true, true],
	'|': ['|', '/', false, true, true],
	'||': ['||', '/', false, true, true],
	'|||': ['|||', '/', false, true, true],
	'||:': ['|', '||:', true, true, false],
	':||': [':||', '/', false, true, true],
	':||:': [':||', '||:', false, true, false],
	'/||': ['/||', '/', false, true, true],
	'/||:': ['/||', '||:', true, true, false],
	':/||': [':/||', '/', false, true, true],
	':/||:': [':/||', '||:', false, true, false]
}
/**
 * 获取对于较大小节线记号保留的边距
 */
export function sectionSeparatorInset(sep: SectionSeparators, isFirstSection: boolean) {
	let beforePad = 0
	let afterPad = 0
	if(sep.before.char == '||:') {
		if(isFirstSection) {
			beforePad = 1.2
		} else {
			beforePad = 0.8
		}
	}
	const a = sep.after.char
	if(a == ':/||' || a == ':/||:' || a == ':||' || a == ':||:') {
		afterPad = 0.8
	}
	return [beforePad, afterPad]
}

/**
 * 音符行中的音符字符
 *
 * 延时线不要放进去
 *
 * delta 的标记方法：
 * - 未标记 `` = NaN
 * - 还原 `=` = 0
 * - 降 `b` = -1
 * - 重降 `bb` = -2
 * - 升 `#` = 1
 * - 重升 `##` = 2
 * - 微分升 `$` = 0.5
 * - 微分降 `%` = -0.5
 */
export type NoteCharMusic = {
	type: 'music'
	sampler: 'music'
	char: string
	octave: number
	/**
	 * 变化音记号，NaN 表示未分配
	 */
	delta: number
	/**
	 * 最终的变化音数值，在 SectionsParser 结束时赋予
	 */
	finalDelta: number
}
export const noteCharChecker: {[_: string]: number} = {
	'0': 0, '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0,
	'8': 0, '9': 0, 'X': 1, 'Y': 1, 'Z': 1, '_': 1
}
/**
 * 力度标记的音符字符
 * 'ppp' | 'pp' | 'p' | 'mp' | 'm' | 'mf' | 'f' | 'ff' | 'fff' |
 * 	'sf' | 'fz' | 'sfz' | 'sfzz' | 'fp' | 'sfp' | 'sfpp' | 'rf' | 'rfs' |
 * 	'<' | '>'
 */
export type NoteCharForce = {
	type: 'force'
	sampler: 'annotations'
	offset: number
	isText: boolean
	char: string
} | {
	type: 'force'
	sampler: 'annotations'
	void: true
}
export const noteCharForceWeight = {
	'ppp': [-25, -25],
	'pp': [-20, -20],
	'p': [-15, -15],
	'mp': [-5, -5],
	'm': [0, 0],
	'mf': [5, 5],
	'f': [15, 15],
	'ff': [20, 20],
	'fff': [25, 25],
	'sf': [32, 32],
	'fz': [35, 35],
	'sfz': [38, 38],
	'sfzz': [42, 42],
	'fp': [15, -15],
	'fpp': [15, -20],
	'sfp': [32, -15],
	'sfpp': [32, -20],
	'rf': [15, 15],
	'rfs': [32, 32],
}
/**
 * 和弦标记的字符
 * 
 * 理论上你是可以用数字表示和弦根音的，可以。但是简谱语境下请不要用罗马数字。
 */
export type NoteCharChord = {
	type: 'chord'
	sampler: 'annotations'
	offset: number
	delta: number
	root: string
	suffix: string
	baseDelta: number
	base?: string
} | {
	type: 'chord'
	sampler: 'annotations'
	void: true
}
/**
 * 文本标记的字符
 */
export type NoteCharText = {
	type: 'text'
	sampler: 'annotations' | 'text'
	offset: number
	text: string
} | {
	type: 'text'
	sampler: 'annotations' | 'text'
	void: true
}
/**
 * 文本标记的段标
 */
export type NoteCharTextHeading = {
	type: 'textHeading'
	sampler: 'annotations'
	offset: number
	content: AttrText | AttrScriptedText
} | {
	type: 'textHeading'
	sampler: 'annotations'
	void: true
}
export type NoteCharAnnotation =
	NoteCharForce |
	NoteCharChord |
	NoteCharText |
	NoteCharTextHeading
export type NoteCharAny =
	NoteCharMusic |
	NoteCharAnnotation

/**
 * 广义音符
 */
export type MusicNote<NoteChar> = {
	/**
	 * 行号
	 */
	lineNumber: number
	/**
	 * 字符范围
	 */
	range: [number, number]
	/**
	 * 唯一 ID
	 * 
	 * 在 NoteEater 结束后由 SectionParser 处理，对装饰音符无效
	 */
	uuid: string
	/**
	 * 起始时间（从小节开头开始计算）
	 */
	startPos: Fraction
	/**
	 * 持续长度（以四分音符数量计）
	 */
	length: Fraction
	/**
	 * 属性
	 */
	attrs: NoteAttr[]
	/**
	 * 后缀修饰符
	 */
	suffix: ('^' | '~' | '.')[]
	/**
	 * 是否被延长连音线清除
	 */
	voided: boolean
} & ({
	type: 'note'
	/**
	 * 音符内容
	 */
	char: NoteChar
} | {
	type: 'extend'
})

/**
 * 区间装饰符
 */
export type MusicDecorationRange = {
	type: 'range'
	/**
	 * 开始位置
	 */
	startPos: Fraction
	/**
	 * 结束位置
	 */
	endPos: Fraction
	/**
	 * 开始位置断连
	 */
	startSplit?: boolean
	/**
	 * 结束位置断连
	 */
	endSplit?: boolean
	/**
	 * 级别
	 * - 对于连音线，表示是否跨小节
	 * - 对于下划线，表示层级，从 1 开始
	 * - 对于三连音，表示记号上需要显示的连音数
	 */
	level: number
} & ({
	/**
	 * 类型
	 */
	char: '_' | '~' | '^'
} | {
	/**
	 * 类型：三连音
	 */
	char: 'T'
	extraNumber?: number // 需要显示的分子
})
/**
 * 插入装饰符
 */
export type MusicDecorationInsert = {
	type: 'insert'
	/**
	 * 目标位置
	 */
	target: Fraction
	/**
	 * 优先级序列号
	 */
	ordinal: number
	/**
	 * 类型
	 */
	char: InsertSymbol
}
/**
 * 装饰符
 */
export type MusicDecoration = MusicDecorationRange | MusicDecorationInsert

/**
 * 小节分隔线
 */
export type SectionSeparator = {
	char: SectionSeparatorChar,
	attrs: SeparatorAttr[]
}
export type SectionSeparators = {
	before: SectionSeparator,  // 此小节前（若在行首）需要的小节线，属性为该小节线的后置属性
	after: SectionSeparator,   // 此小节后（若在行尾）需要的小节线，属性为该小节线的前置属性
	next: SectionSeparator     // 此小节后（若在行中）需要的小节线，属性为该小节线的上方属性
	nextPrev: SectionSeparator // 莫得小节线信息，但是是上一个小节线的上方属性（interLink 阶段赋予）
}
/**
 * 音乐小节
 */
export type MusicSection<NoteChar> = {
	/**
	 * 与源代码关联的身份信息
	 */
	idCard: {
		/**
		 * 被定义的行号
		 */
		lineNumber: number
		/**
		 * 被定义的序号
		 */
		index: number
		/**
		 * 对应声部小节的小节全局 ID
		 * 
		 * 起初任何类型的小节都有自己的 masterId。在列统计阶段，标注小节（包括声部的 FCA 和歌词行的 FCA）的 masterId 会被对应声部的音乐小节覆盖
		 */
		masterId: string
		/**
		 * 自己的全局 ID
		 */
		uuid: string
	}
	/**
	 * 字符范围
	 */
	range: [number, number]
	/**
	 * 小节序号
	 */
	ordinal: number
	/**
	 * 开始位置（以四分音符数量计）
	 */
	startPos: Fraction
	/**
	 * 分配的四分音符数量（仅限声部主旋律及其替代旋律）
	 * 
	 * 替代旋律的对应值在歌词行合并过程中中获得
	 */
	statQuarters?: Fraction
	/**
	 * 小节线类型
	 */
	separator: SectionSeparators
	/**
	 * 乐理属性
	 */
	musicalProps: MusicProps
	/**
	 * 曲式结构校验状态
	 */
	structureValidation: 'pass' | 'conflict'
} & ({
	type: 'section'
	/**
	 * 合计四分音符数量（不是拍数！！！）
	 */
	totalQuarters: Fraction
	/**
	 * 弱起前的四分音符数量
	 */
	upbeatQuarters: Fraction
	/**
	 * 拍数校验状态
	 *
	 * 若拍号中的小节拍数为 0，且该小节不是整数拍，判定为 less
	 */
	beatsValidation: 'pass' | 'less' | 'more'
	/**
	 * 音符列表
	 */
	notes: MusicNote<NoteChar>[]
	/**
	 * 装饰符
	 */
	decoration: MusicDecoration[]
	/**
	 * 联合连音线从左侧断开
	 */
	leftSplit: boolean
	/**
	 * 延长连音线从左侧断开
	 */
	leftSplitVoid: boolean
	/**
	 * 连音线从右侧断开
	 */
	rightSplit: boolean
} | {
	type: 'omit'
	/**
	 * 省略的小节数，NaN 表示“后略”
	 */
	count: number
} | {
	type: 'empty' | 'nullish'
})

export type DestructedLine = {
	lineNumber: number
} & ({
	type: 'title' // 标题、版本号等
	head: 'Dt' | 'Dp' | 'Dv' | 'Ds' | 'Dl' | 'Dr'
	text: string
} | {
	type: 'note' // 包含起始标签的作者、尾注
	head: 'Da' | 'Df'
	tag: string
	text: string
} | {
	type: 'text' // 文本标记
	head: 'T'
	text1: string         // 对齐点之前的文字
	text2: string | null  // 对齐点之后的文字
} | {
	type: 'props' // 乐理属性
	head: 'P' | 'Pi' | 'Sp'
	props: MusicProps
} | {
	type: 'renderProps' // 渲染属性
	head: 'Rp' | 'Srp' | 'Frp'
	props: RenderProps
} | {
	type: 'articleTitle' // 文段标题
	head: 'S'
	text: string
} | {
	type: 'flag'
	head: 'B'
} | {
	type: 'jumper'
	head: 'J'
	openRange: boolean
	attrs: JumperAttr[]
} | {
	type: 'notes'
	head: 'N' | 'Na' | 'Nc'
	tags: PartAttr[]
	sections: MusicSection<NoteCharMusic>[]
} | {
	type: 'notesSubstitute'
	head: 'Ns'
	tags: LrcAttr[]
	substituteLocation: number
	decorations: MusicDecorationRange[]
	sections: MusicSection<NoteCharMusic>[]
} | {
	type: 'annotations'
	head: 'A'
	index: number
	originIndex: number
	sections: MusicSection<NoteCharAnnotation>[]
} | {
	type: 'lyricsAnnotation'
	head: 'La'
	sections: MusicSection<NoteCharText>[]
} | {
	type: 'lyrics'
	head: 'L' | 'Lc' | 'Lw'
	tags: LrcAttr[]
	chars: LyricChar[]
})

export type ScoreProps = {
	title?: DestructedLine & {head: 'Dt'}
	subtitle?: DestructedLine & {head: 'Ds'}
	prescript?: DestructedLine & {head: 'Dp'}
	version?: DestructedLine & {head: 'Dv'},
	descendText: {
		left?: DestructedLine & {head: 'Dl'},
		right?: DestructedLine & {head: 'Dr'}
	},
	authors: (DestructedLine & {head: 'Da'})[]
	footnotes: (DestructedLine & {head: 'Df'})[]
}
/**
 * 解构后的树
 */
export type DestructedScore = {
	lineNumber: number
	/**
	 * 显示属性
	 */
	scoreProps: ScoreProps
	/**
	 * 乐理属性
	 */
	musicalProps?: DestructedLine & {head: 'P'}
	/**
	 * 渲染属性
	 */
	renderProps?: DestructedLine & {head: 'Rp'}
	/**
	 * 文段
	 */
	articles: DestructedArticle[]
}
export type DestructedArticle = {
	lineNumber: number
	/**
	 * 标题
	 */
	title?: DestructedLine & {head: 'S'}
	/**
	 * 渲染属性
	 */
	renderProps?: DestructedLine & {head: 'Srp'}
} & ({
	type: 'music'
	/**
	 * 乐理属性
	 */
	musicalProps?: DestructedLine & {head: 'Sp'}
	/**
	 * 片段
	 */
	fragments: DestructedFragment[]
} | {
	type: 'text'
	/**
	 * 文本行
	 */
	text: (DestructedLine & {head: 'T'})[]
})
export type DestructedFragment = {
	lineNumber: number
	/**
	 * 强制换行
	 */
	break?: DestructedLine & {head: 'B'}
	/**
	 * 跳房子
	 */
	jumper?: DestructedLine & {head: 'J'}
	/**
	 * 渲染属性
	 */
	renderProps?: DestructedLine & {head: 'Frp'}
	/**
	 * 声部
	 */
	parts: DestructedPart[]
}
export type DestructedFCA = {
	/**
	 * 标记符号
	 */
	fcaItems: (DestructedLine & {head: 'A'})[]
}
export type DestructedPart = {
	lineNumber: number
	/**
	 * 音符行
	 */
	notes: DestructedLine & {head: 'N' | 'Na' | 'Nc'}
	/**
	 * 歌词行
	 */
	lyricLines: DestructedLyricLine[]
} & DestructedFCA
export type DestructedLyricLine = {
	lineNumber: number
	/**
	 * 歌词行
	 */
	lyric: DestructedLine & {type: 'lyrics'}
	/**
	 * 标注文本型歌词
	 */
	lyricAnnotations?: DestructedLine & {head: 'La'}
	/**
	 * 替代旋律
	 */
	notesSubstitute: (DestructedLine & {head: 'Ns'})[]
} & DestructedFCA
