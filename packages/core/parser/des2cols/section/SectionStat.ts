import { iterateMap } from "@sparks-notation/util/array";
import { Frac, Fraction } from "@sparks-notation/util/frac";
import { scoreContextDefault } from "../../sparse2des/context";
import { DestructedFCA, MusicDecorationRange, MusicNote, MusicSection, NoteCharAnnotation, NoteCharAny, SectionSeparatorChar, sectionSeparatorCharMap, SeparatorAttr } from "../../sparse2des/types";
import { Jumper, LinedLyricLine, Linked2LyricLine, Linked2LyricSection } from "../types";

export module SectionStat {
	export const nullish: MusicSection<never> = {
		idCard: {
			lineNumber: -1,
			index: -1,
			masterId: '',
			uuid: ''
		},
		range: [-1, -1],
		ordinal: 0,
		startPos: Frac.create(0),
		separator: {
			before: {char: '/', attrs: []},
			after: {char: '/', attrs: []},
			next: {char: '/', attrs: []},
			nextPrev: {char: '/', attrs: []}
		},
		musicalProps: scoreContextDefault.musical,
		structureValidation: 'pass',
		type: 'nullish',
	}
	/**
	 * 小节列填充（作用同 paintArray 函数）
	 */
	export function paint<CharType>(sections: MusicSection<CharType>[], data: MusicSection<CharType>[] | undefined, offset: number, padLength: number) {
		if(data === undefined) {
			data = []
		}
		if(padLength == -1) {
			padLength = data.length
		}
		while(sections.length < offset) {
			sections.push({...nullish})
		}
		for(let i = 0; i < padLength; i++) {
			sections[offset + i] = (i < data.length) ? data[i] : {...nullish}
		}
	}
	/**
	 * 小节代表的实际小节数
	 * 
	 * 规则：omit(x) 代表 x 个小节，其余均为 1 小节
	 */
	export function ordinalCount(section: MusicSection<unknown>) {
		if(section.type == 'omit') {
			if(section.count != section.count) {
				return 1
			}
			return section.count
		}
		return 1
	}
	/**
	 * 小节的四分音符数量
	 * 
	 * - space, omit, nullish 按照乐理属性的一小节（即 4 * K_s），omit(x) 按照 x 个小节。
	 * - 正常音乐小节按照字面计算，若 next 小节线不含有 `/`，和乐理属性要求取 max。
	 * - 若正常小节的统计量为 0，将使用 1/2。
	 */
	export function quarterCount(section: MusicSection<unknown>): Fraction {
		let shouldBe = Frac.mul(Frac.create(4), section.musicalProps.beats!.value)
		if(Frac.equals(shouldBe, Frac.create(0))) {
			shouldBe = Frac.create(1, 2)
		}
		if(section.type == 'omit') {
			if(section.count != section.count) {
				return shouldBe
			}
			// return Frac.mul(shouldBe, Frac.create(section.count))
			return shouldBe
		}
		if(section.type != 'section') {
			return shouldBe
		}
		if(section.separator.next.char.indexOf('/') != -1) {
			if(Frac.compare(section.totalQuarters, Frac.create(0)) > 0) {
				return section.totalQuarters
			} else {
				return Frac.create(1, 2)
			}
		}
		if(!Frac.equals(section.musicalProps.beats!.value, Frac.create(0))) {
			if(!Frac.equals(section.totalQuarters, shouldBe)) {
				let ch = Frac.compare(section.totalQuarters, shouldBe)
				if(ch > 0) {
					section.beatsValidation = 'more'
				} else {
					section.beatsValidation = 'less'
				}
			}
		} else {
			// 散板节拍型仅判断拍数是否为整数
			const beats = Frac.prod(Frac.create(section.musicalProps.beats!.value.y), Frac.create(1, 4), section.totalQuarters)
			if(beats.y != 1) {
				section.beatsValidation = 'less'
			}
		}
		return Frac.max(section.totalQuarters, shouldBe)
	}
	/**
	 * 连接小节内部和小节之间的连音线，并合并 ||: 小节线
	 */
	export function interLink<CharType>(sections: MusicSection<CharType>[], decorations: MusicDecorationRange[]) {
		// ===== 处理联合连音线 =====
		let pendingNote: MusicNote<CharType> | undefined = undefined as any
		let lastPlace = Frac.create(0)
		let leftSplit = false
		let lastSection: MusicSection<CharType> | undefined = undefined as any
		sections.forEach((section, index) => {
			if(section.type != 'section') {
				pendingNote = undefined
				return
			}
			if(section.leftSplit) {
				// 创建左分割的连音线
				lastPlace = Frac.copy(section.startPos)
				pendingNote = true as any
				leftSplit = true
				lastSection = undefined
			}
			let isFirst = true
			section.notes.forEach((note) => {
				isFirst = false
				if(note.suffix.indexOf('^') != -1) {
					if(undefined === pendingNote) {
						pendingNote = note
						lastSection = section
						lastPlace = Frac.add(section.startPos, note.startPos)
					} else {
						pendingNote = undefined
						const currPlace = Frac.add(section.startPos, note.startPos)
						decorations.push({
							type: 'range',
							level: section == lastSection ? 0 : 1,
							startPos: lastPlace,
							startSplit: leftSplit,
							endPos: currPlace,
							char: '^'
						})
						leftSplit = false
					}
				}
			})
			if(section.rightSplit && pendingNote) {
				const nextSection = sections[index + 1]
				const currPlace = nextSection ? nextSection.startPos : Frac.add(section.startPos, section.statQuarters ?? section.totalQuarters)
				// 创建右分割连音线
				decorations.push({
					type: 'range',
					level: 1,
					startPos: lastPlace,
					startSplit: leftSplit,
					endSplit: true,
					endPos: currPlace,
					char: '^'
				})
				leftSplit = false
				pendingNote = undefined
			}
		})
		// ===== 处理延长连音线 =====
		lastSection = undefined
		pendingNote = undefined
		leftSplit = false
		let connectState = false
		sections.forEach((section, index) => {
			if(section.type != 'section') {
				pendingNote = undefined
				return
			}
			if(section.leftSplitVoid) {
				// 创建左分割的连音线
				connectState = true
				lastSection = undefined
				pendingNote = undefined
				lastPlace = Frac.copy(section.startPos)
				leftSplit = true
			}
			section.notes.forEach((note) => {
				if(note.type == 'extend') {
					// 无效的延时线尝试延长上一个音符（）
					// TODO[]: 替代此机制
					if(note.voided && pendingNote) {
						pendingNote.length = Frac.add(pendingNote.length, note.length)
					}
					return
				}
				if(connectState) {
					note.voided = true
					if(pendingNote) {
						// 延长上一个音符
						pendingNote.length = Frac.add(pendingNote!.length, note.length)
					}
					const currPlace = Frac.add(section.startPos, note.startPos)
					decorations.push({
						type: 'range',
						level: section == lastSection ? 0 : 1,
						startPos: lastPlace,
						startSplit: leftSplit,
						endPos: currPlace,
						char: '~',
					})
					leftSplit = false
					lastSection = section
					lastPlace = currPlace
					if(note.suffix.indexOf('~') == -1) {
						connectState = false
					}
				} else {
					if(note.suffix.indexOf('~') != -1) {
						connectState = true
						pendingNote = note
						const currPlace = Frac.add(section.startPos, note.startPos)
						lastSection = section
						lastPlace = currPlace
					} else {
						// 对应无效延时线的机制
						connectState = false
						pendingNote = note
					}
				}
			})
			if(section.rightSplit && connectState) {
				const nextSection = sections[index + 1]
				const currPlace = nextSection ? nextSection.startPos : Frac.add(section.startPos, section.statQuarters ?? section.totalQuarters)
				decorations.push({
					type: 'range',
					level: 1,
					startPos: lastPlace,
					startSplit: leftSplit,
					endPos: currPlace,
					endSplit: true,
					char: '~',
				})
				leftSplit = false
				lastSection = section
				lastPlace = currPlace
				connectState = false
			}
		})
		// ===== 连接小节线 =====
		let prevSection: MusicSection<CharType> | undefined = undefined as any
		sections.forEach((section) => {
			if(prevSection) {
				section.separator.nextPrev = {
					...section.separator.nextPrev,
					attrs: [ ...prevSection.separator.next.attrs, ...section.separator.nextPrev.attrs ]
				}
				if(section.separator.before.char == '||:') {
					const replacementChar = ((): SectionSeparatorChar => {
						const char = prevSection.separator.next.char
						let foundOne = char
						iterateMap(sectionSeparatorCharMap, (pair, base) => {
							if(pair[1] == '||:' && pair[0] == char) {
								foundOne = base as SectionSeparatorChar
							}
						})
						return foundOne
					})()
					prevSection.separator.next.char = replacementChar
				}
			}
			prevSection = section
		})
	}
	/**
	 * 统计小节是否全部为 nullish，若是，说明此渲染行可以不包含这个声部（或者歌词行）
	 */
	export function allNullish(sections: {type: string}[], startSection: number, sectionCount: number) {
		for(let i = startSection; i < startSection + sectionCount; i++) {
			if(sections[i].type != 'nullish') {
				return false
			}
		}
		return true
	}
	/**
	 * 统计小节是否全部无音符，若是，说明标记或歌词行的渲染空间可以被省略
	 */
	export function lyricsOrAnnAllEmpty(sections: MusicSection<NoteCharAny>[], startSection: number, sectionCount: number) {
		for(let i = startSection; i < startSection + sectionCount; i++) {
			const section = sections[i]
			if(section.type == 'section') {
				for(let note of section.notes) {
					if(note.type == 'note' && !note.voided && !('void' in note.char)) {
						return false
					}
				}
			}
			if(hasRenderableSeparatorSideAttrs({}, section, false, false)) {
				return false;
			}
		}
		return true
	}
	/**
	 * 统计某个歌词小节是否无实质内容，用于计算歌词行回落
	 */
	export function isLyricSectionEmpty(section: Linked2LyricSection) {
		if(section.type != 'section') {
			return true
		}
		for(let char of section.chars) {
			if(char.text || char.prefix || char.rolePrefix || char.postfix || char.extension) {
				return false
			}
		}
		return true
	}
	/**
	 * 歌词行内某个小节是否值得渲染
	 * 
	 * 需要考虑歌词行本身是否有实质内容，以及歌词行的标记是否有内容
	 */
	export function isLyricSectionRenderWorthy(lyricLine: LinedLyricLine | Linked2LyricLine, index: number) {
		if(!isLyricSectionEmpty(lyricLine.sections[index])) {
			return true
		}
		if(!lyricsOrAnnAllEmpty([lyricLine.lyricAnnotations!.sections[index]], 0, 1)) {
			return true
		}
		for(let ann of lyricLine.fcaItems) {
			if(!lyricsOrAnnAllEmpty([ann.sections[index]], 0, 1)) {
				return true
			}
		}
		return false
	}
	/**
	 * 歌词行区间是否值得渲染
	 */
	export function isLrcLineRenderWorthy(lyricLine: LinedLyricLine | Linked2LyricLine, startSection: number, sectionCount: number) {
		for(let i = startSection; i < startSection + sectionCount; i++) {
			if(isLyricSectionRenderWorthy(lyricLine, i)) {
				return true
			}
		}
		return false
	}
	/**
	 * 统计歌词小节组是否无实质内容
	 */
	export function isLrcLineTextRenderWorthy(lyricLine: LinedLyricLine | Linked2LyricLine) {
		const sections = lyricLine.sections
		for(let section of sections) {
			if(!isLyricSectionEmpty(section)) {
				return true
			}
		}
		if(lyricLine.lyricAnnotations && !lyricsOrAnnAllEmpty(lyricLine.lyricAnnotations.sections, 0, lyricLine.lyricAnnotations.sections.length)) {
			return true
		}
		return false
	}
	/**
	 * 含小节行切取
	 */
	export function subLine<T extends {sections: MusicSection<unknown>[]}>(line: T, startSection: number, sectionCount: number, overwriteIdSections?: MusicSection<unknown>[]): T {
		return {
			...line,
			sections: line.sections.slice(startSection, startSection + sectionCount).map((section, index) => {
				if(overwriteIdSections && overwriteIdSections.length > index) {
					section.idCard.masterId = overwriteIdSections[index].idCard.masterId
				}
				return section
			})
		}
	}
	export function __indexSort<T>(arr: T[], getIndex: (item: T) => number[]) {
		arr.sort((a, b) => {
			const aIndex = getIndex(a)
			const bIndex = getIndex(b)
			let indexLen = Math.max(aIndex.length, bIndex.length)
			for(let i = 0; i < indexLen; i++) {
				const ia = aIndex[i], ib = bIndex[i]
				if(ia === undefined || ia == -1) {
					return -1
				}
				if(ib === undefined || ib == -1) {
					return 1
				}
				if(ia < ib) {
					return -1
				}
				if(ia > ib) {
					return 1
				}
			}
			return 0
		})
	}
	/**
	 * 索引排序
	 */
	export function indexSort<T extends {index: number[]}>(arr: T[]) {
		return __indexSort(arr, item => item.index)
	}

	/**
	 * 小节区间是否有重叠
	 */
	export function sectionRangeOverlaps(p1: [number, number], p2: [number, number]) {
		const [ l1, r1 ] = [ p1[0], p1[0] + p1[1] ]
		const [ l2, r2 ] = [ p2[0], p2[0] + p2[1] ]
		return Math.min(r1, r2) - Math.max(l1, l2) > 0
	}

	/**
	 * 音符区间是否有重叠
	 */
	export function fieldOverlaps(windowRange: [Fraction, Fraction], symbolRange: [Fraction, Fraction]) {
		let [ l1, r1 ] = [ windowRange[0], Frac.add(windowRange[0], windowRange[1]) ]
		let [ l2, r2 ] = [ symbolRange[0], symbolRange[1] ]
		if(Frac.isIndeterminate(l2)) {
			l2 = r2
		}
		if(Frac.equals(r2, l1)) {
			return true
		}
		if(Frac.equals(l2, r2)) {
			return Frac.compare(l1, l2) <= 0 &&
				Frac.compare(l2, r1) < 0
		}
		return Frac.compare(Frac.sub(Frac.min(r1, r2), Frac.max(l1, l2)), Frac.create(0)) > 0
	}
	
	/**
	 * 连接跳房子符号（这一操作对原始数据有破坏）
	 */
	export function connectJumpers_m(jumpers: Jumper[]): Jumper[] {
		const ret: Jumper[] = []

		jumpers.sort((x, y) => {
			return x.startSection - y.startSection
		})

		let lastSig = ''
		let lastPushed: Jumper | undefined = undefined as any
		jumpers.forEach((jumper) => {
			// 跳房子为空时，也延续上一个记号。
			const currSig = jumper.attrs.length == 0 ? lastSig : JSON.stringify(jumper.attrs)

			if(lastPushed && currSig == lastSig && lastPushed.endSection == jumper.startSection) {
				lastPushed.endSection = jumper.endSection
			} else {
				ret.push(lastPushed = jumper)
			}
			lastSig = currSig
		})

		return ret
	}

	/**
	 * 定位位置所在的小节
	 * 
	 * 返回小节的索引，如果在系统之外，返回 -1
	 */
	export function locateSection<T>(pos: Fraction, sections: MusicSection<T>[]) {
		for(let i = 0; i < sections.length; i++) {
			const section = sections[i]
			const startPos = sections[i].startPos
			let quarters = section.statQuarters ?? (section.type == 'section' ? section.totalQuarters : Frac.create(0))
			const endPos = Frac.add(sections[i].startPos, quarters)
			if(Frac.compare(startPos, pos) <= 0 && Frac.compare(pos, endPos) < 0) {
				return i
			}
		}
		return -1
	}
	/**
	 * 找出位置对应的音符
	 */
	export function locateNote<T>(pos: Fraction, sections: MusicSection<T>[]): MusicNote<T> | undefined {
		const secIndex = locateSection(pos, sections)
		if(secIndex == -1) {
			return undefined
		}
		const section = sections[secIndex]
		if(section.type != 'section') {
			return undefined
		}
		for(let note of section.notes) {
			if(Frac.equals(Frac.add(section.startPos, note.startPos), pos)) {
				return note
			}
		}
		return undefined
	}

	/**
	 * 小节是否包含前置/后置小节线属性
	 */
	export function hasRenderableSeparatorSideAttrs(partInfo: {
		notes?: {head?: string}
		noMargin?: [boolean, boolean]
	}, section: MusicSection<unknown>, beforeOnly: boolean = false, ignoreOpenRange: boolean = false) {
		if((partInfo?.notes?.head == 'Na' || partInfo?.notes?.head == 'Nc') && partInfo?.noMargin && partInfo.noMargin[0]) {
			return false
		}
		function checkSeparatorAttrs(attrs: SeparatorAttr[]) {
			if(!ignoreOpenRange && attrs.filter(attr => attr.type == 'openRange').length != 0) {
				return false
			}
			return attrs.filter((attr) => {
				return attr.type != 'weight' && attr.type != 'padding' && attr.type != 'beats' && attr.type != 'top' && attr.type != 'openRange'
			}).length != 0
		}
		return checkSeparatorAttrs(section.separator.before.attrs) || (!beforeOnly && checkSeparatorAttrs(section.separator.after.attrs))
	}
	/**
	 * 小节是否包含 openRange(*) 作为前/后属性
	 */
	export function openRangeMarked(section: MusicSection<unknown>) {
		function checkSeparatorAttrs(attrs: SeparatorAttr[]) {
			if(attrs.filter(attr => attr.type == 'openRange').length != 0) {
				return true
			}
			return false
		}

		return (
			checkSeparatorAttrs(section.separator.before.attrs) ||
			checkSeparatorAttrs(section.separator.after.attrs)
		)
	}
	/**
	 * 小节线是否包含能渲染的上方属性
	 */
	export function hasSeparatorTopAttrs(section: MusicSection<unknown>) {
		for(let attr of section.separator.next.attrs) {
			if(['text', 'scriptedText', 'repeat'].includes(attr.type)) {
				return true
			}
		}
	}

	/**
	 * 获取 FCA 中的第一标记行的小节
	 */
	export function fcaPrimary(section: DestructedFCA) {
		if(section.fcaItems.length > 0) {
			for(let ann of section.fcaItems) {
				if(!SectionStat.lyricsOrAnnAllEmpty(ann.sections, 0, ann.sections.length)) {
					return ann.sections
				}
			}
		}
		return undefined
	}
	/**
	 * 获取 FCA 中的最后标记行的小节
	 */
	export function fcaLast(section: DestructedFCA) {
		let result: MusicSection<NoteCharAnnotation>[] | undefined = undefined
		if(section.fcaItems.length > 0) {
			for(let ann of section.fcaItems) {
				if(!SectionStat.lyricsOrAnnAllEmpty(ann.sections, 0, ann.sections.length)) {
					result = ann.sections
				}
			}
		}
		return result
	}
}
