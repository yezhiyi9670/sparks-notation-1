import { expandArray, fillArray, findWithKey, iterateMap, paintArray } from "@sparks-notation/util/array";
import { Frac, Fraction } from "@sparks-notation/util/frac";
import { LinedIssue } from "../parser";
import { addMusicProp, addRenderProp, ScoreContext, scoreContextDefault } from "../sparse2des/context";
import { AttrPadding, AttrWeight, DestructedArticle, DestructedFCA, DestructedLine, DestructedScore, MusicSection, NoteCharAny, NoteCharMusic } from "../sparse2des/types";
import { SectionStat } from "./section/SectionStat";
import { ColumnScore, Jumper, LinedArticle, LinedLine, LinedLyricLine, LinedPart, Linked1LyricLine, Linked2Article, Linked2LyricChar, Linked2LyricLine, Linked2LyricSection, LinkedArticle, LinkedPart, LyricLineSignature, lyricLineSignature, partSignature, PartSignature } from "./types";

type ArticleBase = {
	type: 'music'
	musicalProps?: DestructedLine & {type: 'props'}
	renderProps?: DestructedLine & {type: 'renderProps'}
} | {
	type: 'text'
}

export class ColumnStater {
	input: DestructedScore

	constructor(input: DestructedScore) {
		this.input = input
	}

	parse(issues: LinedIssue[]) {
		const linked = this.applyArticle(this.flattenArticle, this.input, issues)
		this.applyArticle(this.allocateLocation, linked, issues)
		this.applyArticle(this.interLink1, linked, issues)
		const linked2 = this.applyArticle(this.flatten2Article, linked, issues)
		const lined = this.applyArticle(this.linifyArticle, linked2, issues)
		return { lined: lined, flattened: linked2 }
	}

	applyArticle<I extends ArticleBase, O>(func: (article: I, context: ScoreContext, issues: LinedIssue[]) => O, input: ColumnScore<I>, issues: LinedIssue[]): ColumnScore<O> {
		const oldContext: ScoreContext = addMusicProp(addRenderProp(
			scoreContextDefault, input.renderProps?.props
		), input.musicalProps?.props)
		return Object.assign({}, this.input, {
			articles: input.articles.map((article) => {
				return func(article, addMusicProp(
					addRenderProp(oldContext, article.type == 'music' ? article.renderProps?.props : undefined),
					article.type == 'music' ? article.musicalProps?.props : undefined
				), issues)
			})
		})
	}

	flattenArticle = (article: DestructedArticle, context: ScoreContext, issues: LinedIssue[]): LinkedArticle => {
		const nMap: number[] = []
		const timeLiningMap: boolean[] = []
		const breakMap: boolean[] = []
		if(article.type == 'text') {
			return {
				lineNumber: article.lineNumber,
				type: 'text',
				title: article.title,
				renderProps: article.renderProps,
				text: article.text
			}
		}
		const jumpers: Jumper[] = []
		// 第一轮合并
		let partSignatures: PartSignature[] = []
		const parts1: {[_: string]: LinkedPart} = {}
		let sectionIndex = 0
		article.fragments.forEach((fragment) => {
			let maxSectionCount = 0
			const fragContext = addRenderProp(context, fragment.renderProps?.props)
			fragment.parts.forEach((part) => {
				maxSectionCount = Math.max(maxSectionCount, part.notes.sections.length)
			})
			fragment.parts.forEach((part, index) => {
				const sig = partSignature(part.notes.head, part.notes.tags, index)
				if(!findWithKey(partSignatures, 'hash', sig.hash)) {
					partSignatures.push(sig)
					parts1[sig.hash] = {
						lineNumber: part.lineNumber,
						signature: sig,
						notes: {
							lineNumber: -1,
							type: 'notes',
							head: part.notes.head,
							tags: part.notes.tags,
							sections: [],
						},
						lyricLines: [],
						fcaItems: [],
						indexMap: [],
						headMap: [],
						decorations: []
					}
				}
				const frontier = parts1[sig.hash]
				// 合并小节
				SectionStat.paint(frontier.notes.sections, part.notes.sections, sectionIndex, maxSectionCount)
				this.mergeFCA(frontier, part, sectionIndex, maxSectionCount)
				// 歌词行暂时性合并操作
				part.lyricLines.forEach((lrcLine, index) => {
					const newLrcLine = Object.assign({}, lrcLine, {
						offset: sectionIndex,
						index: index
					})
					frontier.lyricLines.push(newLrcLine)
					// 替换位置换算
					newLrcLine.notesSubstitute.forEach((Ns) => {
						Ns.substituteLocation += sectionIndex - 1
					})
				})
				// 合并 indexMap
				fillArray(frontier.indexMap, sectionIndex, maxSectionCount, index, () => -1)
				fillArray(frontier.headMap, sectionIndex, maxSectionCount, part.notes.head, () => undefined)
			})
			if(fragment.jumper) {
				jumpers.push({
					startSection: sectionIndex,
					endSection: sectionIndex + maxSectionCount,
					openRange: fragment.jumper.openRange,
					attrs: fragment.jumper.attrs
				})
			}
			fillArray(nMap, sectionIndex, maxSectionCount, fragContext.render.n!, () => -1)
			fillArray(timeLiningMap, sectionIndex, maxSectionCount, fragContext.render.time_lining!, () => false)
			if(fragment.break !== undefined) {
				fillArray(breakMap, sectionIndex, 1, true, () => false)
			}
			sectionIndex += maxSectionCount
		})
		// 填充
		iterateMap(parts1, (data, index) => {
			expandArray(data.notes.sections, sectionIndex, () => ({...SectionStat.nullish}))
			this.refineFCA(data, sectionIndex)
			let lastIndex = -1
			let lastNotesHead: ('N' | 'Na' | 'Nc') = 'N'
			for(let i = data.indexMap.length - 1; i >= 0; i--) {
				if(data.indexMap[i] == -1) {
					data.indexMap[i] = lastIndex
				} else {
					lastIndex = data.indexMap[i]
				}
				if(data.headMap[i] == undefined) {
					data.headMap[i] = lastNotesHead
				} else {
					lastNotesHead = data.headMap[i]
				}
			}
		})
		expandArray(breakMap, sectionIndex, () => false)
		const parts: LinkedPart[] = []
		iterateMap(parts1, (data) => parts.push(data))

		SectionStat.__indexSort(parts, item => item.indexMap)

		return {
			lineNumber: article.lineNumber,
			type: 'music',
			sectionCount: sectionIndex,
			title: article.title,
			musicalProps: article.musicalProps,
			renderProps: article.renderProps,
			partSignatures: partSignatures,
			jumpers: jumpers,
			columns: [],
			parts: parts,
			nMap: nMap,
			timeLiningMap: timeLiningMap,
			breakMap: breakMap,
			sectionFields: []
		}
	}

	mergeFCA(frontier: DestructedFCA, data: DestructedFCA, offset: number, length: number) {
		// 辅助符号
		data.fcaItems.forEach((ann) => {
			let curr = frontier.fcaItems.filter(item => {
				return item.head == ann.head && item.index == ann.index && item.originIndex == ann.originIndex
			})[0]
			if(curr === undefined) {
				expandArray(frontier.fcaItems, frontier.fcaItems.length + 1, () => curr = (() => {
					return {
						lineNumber: -1,
						type: 'annotations',
						head: 'A',
						index: ann.index,
						originIndex: ann.originIndex,
						sections: []
					}
				})())
			}
			SectionStat.paint(curr.sections as MusicSection<NoteCharAny>[], ann.sections, offset, length)
		})
	}
	refineFCA(frontier: DestructedFCA, totalLength: number) {
		frontier.fcaItems.forEach((ann) => {
			expandArray(ann.sections as MusicSection<NoteCharAny>[], totalLength, () => ({...SectionStat.nullish}))
		})
	}

	allocateLocation = (article: LinkedArticle, context: ScoreContext, issues: LinedIssue[]) => {
		if(article.type == 'text') {
			return
		}
		let currOrdinal = 0
		let currQuarter = Frac.create(0)
		for(let i = 0; i < article.sectionCount; i++) {
			let ordinalCount = Math.max(...article.parts.map((part) => {
				return SectionStat.ordinalCount(part.notes.sections[i])
			}))
			let quarterCount = Frac.max(...article.parts.map((part) => {
				return SectionStat.quarterCount(part.notes.sections[i])
			}))
			article.parts.map((part) => {
				part.notes.sections[i].statQuarters = quarterCount
			})

			article.parts.forEach((part) => {
				part.notes.sections[i].ordinal = currOrdinal
				part.notes.sections[i].startPos = Frac.copy(currQuarter)
				this.allocateFCA(part, i, currOrdinal, currQuarter, quarterCount)
			})

			article.sectionFields.push([currQuarter, quarterCount])

			currOrdinal += ordinalCount
			currQuarter = Frac.add(currQuarter, quarterCount)
		}
	}
	allocateFCA(part: LinkedPart, index: number, currOrdinal: number, currQuarter: Fraction, statQuarters: Fraction) {
		part.fcaItems.map((ann) => {
			ann.sections[index].ordinal = currOrdinal
			ann.sections[index].startPos = currQuarter
			ann.sections[index].statQuarters = statQuarters
		})
	}

	interLink1 = (article: LinkedArticle, context: ScoreContext, issues: LinedIssue[]) => {
		if(article.type == 'text') {
			return
		}
		article.parts.forEach((part) => {
			SectionStat.interLink(part.notes.sections, part.decorations)
			part.fcaItems.forEach((ann) => {
				SectionStat.interLink(ann.sections as MusicSection<NoteCharAny>[], [])
			})
		})
	}

	flatten2Article = (article: LinkedArticle, context: ScoreContext, issues: LinedIssue[]): Linked2Article => {
		if(article.type == 'text') {
			return article
		}
		const { parts, ...articleMore } = article
		const sectionCount = article.sectionCount
		return {
			parts: parts.map((part) => {
				const { lyricLines, ...partMore } = part
				const lyricLineSignatures: LyricLineSignature[] = []
				const lyricLines1: {[_: string]: Linked2LyricLine} = {}
				const lyricSectionNullish = {
					ordinal: 0, startPos: Frac.create(0),
					type: 'nullish'
				}
				// 第一轮合并
				part.lyricLines.map((lyricLine) => {
					const sig = lyricLineSignature(lyricLine.lyric.tags, lyricLine.index)
					if(!findWithKey(lyricLineSignatures, 'hash', sig.hash)) {
						lyricLineSignatures.push(sig)
						lyricLines1[sig.hash] = {
							lineNumber: -1,
							sections: [],
							notesSubstitute: [],
							lyricAnnotations: {
								lineNumber: -1,
								type: 'lyricsAnnotation',
								head: 'La',
								sections: []
							},
							attrsMap: [],
							fcaItems: [],
							indexMap: [],
							signature: sig
						}
					}
					const frontier = lyricLines1[sig.hash]
					// 合并小节
					this.mergeFCA(frontier, lyricLine, lyricLine.offset, -1)
					SectionStat.paint(frontier.lyricAnnotations!.sections, lyricLine.lyricAnnotations?.sections, lyricLine.offset, -1)
					// 合并 indexMap
					fillArray(frontier.indexMap, lyricLine.offset, sectionCount - lyricLine.offset, lyricLine.index, () => -1)
					// 合并 attrsMap
					fillArray(frontier.attrsMap, lyricLine.offset, sectionCount - lyricLine.offset, lyricLine.lyric.tags, () => [])
					// 合并替代段落
					lyricLine.notesSubstitute.forEach((Ns) => {
						// 分配序号
						Ns.sections.forEach((section, index) => {
							const myIndex = index + Ns.substituteLocation
							const mySection = part.notes.sections[myIndex]
							if(mySection) {
								section.startPos = mySection.startPos
								section.statQuarters = mySection.statQuarters
								section.ordinal = mySection.ordinal
							}
						})
						// 小节连接
						SectionStat.interLink(Ns.sections, Ns.decorations)
						// 节拍校验
						for(let section of Ns.sections) {
							SectionStat.quarterCount(section)
						}
						frontier.notesSubstitute.push(Ns)
					})
					// 歌词小节化并合并（为防止连音线问题应当在小节连接之后）
					const lrcSections = this.sectionifyLyrics(lyricLine, part.notes.sections, context, issues)
					paintArray(frontier.sections, lrcSections, lyricLine.offset, -1, () => ({...lyricSectionNullish}))
				})
				// 填充
				iterateMap(lyricLines1, (lyricLine) => {
					expandArray(lyricLine.sections, sectionCount, () => ({...lyricSectionNullish}))
					expandArray(lyricLine.lyricAnnotations!.sections, sectionCount, () => ({...SectionStat.nullish}))
					this.refineFCA(lyricLine, sectionCount)
					let val0 = -1
					for(let i = lyricLine.indexMap.length - 1; i >= 0; i--) {
						if(lyricLine.indexMap[i] == -1) {
							lyricLine.indexMap[i] = val0
						} else {
							val0 = lyricLine.indexMap[i]
						}
					}
				})
				// 返回结果
				return {
					lyricLines: iterateMap(lyricLines1, (lyricLine) => {
						// 分配 FCA 的位置
						function allocateLyricLineFCA(article: LinkedArticle & {type: 'music'}, sections: MusicSection<NoteCharAny>[]) {
							sections.forEach((section, index) => {
								if(index < article.sectionCount) {
									section.startPos = article.sectionFields[index][0]
									section.statQuarters = article.sectionFields[index][1]
								}
							})
						}
						lyricLine.fcaItems.forEach((ann) => {
							allocateLyricLineFCA(article, ann.sections)
							SectionStat.interLink(ann.sections as MusicSection<NoteCharAny>[], [])
						})
						allocateLyricLineFCA(article, lyricLine.lyricAnnotations!.sections)
						return lyricLine
					}),
					lyricLineSignatures: [],
					...partMore
				}
			}),
			...articleMore
		}
	}
	sectionifyLyrics(lyricLine: Linked1LyricLine, reference: MusicSection<NoteCharMusic>[], context: ScoreContext, issues: LinedIssue[]): Linked2LyricSection[] {
		let ret: Linked2LyricSection[] = []
		const chars = lyricLine.lyric.chars
		let tokenPtr = 0
		for(let secPtr = lyricLine.offset; secPtr < reference.length; secPtr++) {
			if(tokenPtr >= chars.length) {
				break
			}
			let matchedChars: Linked2LyricChar[] = []
			const section0 = reference[secPtr]
			let section = section0
			lyricLine.notesSubstitute.forEach((Ns) => {
				if(Ns.substituteLocation <= secPtr && Ns.substituteLocation + Ns.sections.length > secPtr) {
					section = Ns.sections[secPtr - Ns.substituteLocation]
				}
			})
			if(section.type != 'section') {
				ret.push({
					ordinal: section0.ordinal,
					startPos: section0.startPos,
					type: 'nullish'
				})
				continue
			}
			for(let note of section.notes) {
				if(note.type != 'note' || note.voided || note.char.char == '0') {
					continue
				}
				if(tokenPtr >= chars.length) {
					break
				}
				let readMine = false
				while(true) {
					const myChar = chars[tokenPtr++]
					if(myChar === undefined) {
						break
					}
					if(myChar.occupiesSpace && readMine) {
						tokenPtr--
						break
					}
					matchedChars.push(Object.assign({}, myChar, {
						startPos: Frac.copy(note.startPos),
						length: note.length
					}))
					if(myChar.occupiesSpace) {
						readMine = true
					}
				}
			}
			ret.push({
				ordinal: section0.ordinal,
				startPos: section0.startPos,
				type: 'section',
				chars: matchedChars
			})
		}
		return ret
	}

	linifyArticle = (article: Linked2Article, context: ScoreContext, issues: LinedIssue[]): LinedArticle => {
		let lines: LinedLine[] = []
		if(article.type == 'text') {
			return article
		}
		let sectionPtr = 0
		while(sectionPtr < article.sectionCount) {
			const sectionCountShould = article.nMap[sectionPtr]
			const timeLining = article.timeLiningMap[sectionPtr]
			let sectionCount = Math.min(article.sectionCount - sectionPtr, sectionCountShould)
			for(let i = sectionPtr + 1; i < sectionPtr + sectionCount; i++) {
				if(i < article.sectionCount && article.breakMap[i]) {
					sectionCount = i - sectionPtr
					break
				}
			}
			const secIndices: number[] = []
			for(let i = sectionPtr; i < sectionPtr + sectionCount; i++) {
				secIndices.push(i)
			}
			const field = [
				article.sectionFields[sectionPtr][0],
				Frac.sum(...secIndices.map((idx) => {
					return article.sectionFields[idx][1]
				}))
			] as [Fraction, Fraction]
			article.jumpers = SectionStat.connectJumpers_m(article.jumpers)
			// 确定需要的声部
			const sigs: PartSignature[] = []
			const parts: LinedPart[] = []
			const sectionWeights: number[] = Array(sectionCount).fill(0)
			const sectionPadding: number[] = Array(sectionCount).fill(0)
			article.parts.forEach((part) => {
				if(SectionStat.allNullish(part.notes.sections, sectionPtr, sectionCount)) {
					// 此渲染行可以不包含这一声部。正常而言，空白区下方不会有非空的歌词行。
					return
				}
				sigs.push(part.signature)

				const mappedNotes = SectionStat.subLine(part.notes, sectionPtr, sectionCount)
				const sectionsIn = mappedNotes.sections

				const lrcSigs: LyricLineSignature[] = []
				const lrcLines: LinedLyricLine[] = []
				part.lyricLines.forEach((lrcLine) => {
					const mappedNs = lrcLine.notesSubstitute.filter((Ns) => {
						return SectionStat.sectionRangeOverlaps([sectionPtr, sectionCount], [
							Ns.substituteLocation,
							Ns.sections.length
						])
					}).map((Ns) => {
						return {
							...Ns,
							substituteLocation: Ns.substituteLocation - sectionPtr
						}
					}).map((Ns) => {
						// Clipping
						if(Ns.substituteLocation < 0) {
							Ns.sections = Ns.sections.slice(-Ns.substituteLocation)
							Ns.substituteLocation = 0
						}
						const leftLength = sectionCount - Ns.substituteLocation
						if(Ns.sections.length > leftLength) {
							Ns.sections = Ns.sections.slice(0, leftLength)
						}
						Ns.decorations = Ns.decorations.filter((decor) => {
							return SectionStat.fieldOverlaps(
								field,
								[decor.startPos, decor.endPos]
							)
						})
						return Ns
					})
					if(!SectionStat.isLrcLineRenderWorthy(lrcLine, sectionPtr, sectionCount) && mappedNs.length == 0) {
						// 此行声部可以不包含这一歌词行
						return
					}
					lrcSigs.push(lrcLine.signature)
					const { fcaItems, sections, indexMap, attrsMap, lyricAnnotations, notesSubstitute, ...others } = lrcLine
					lrcLines.push({
						sections: sections.slice(sectionPtr, sectionPtr + sectionCount),
						index: indexMap.slice(sectionPtr, sectionPtr + sectionCount),
						attrs: attrsMap[sectionPtr],
						lyricAnnotations: lyricAnnotations ?
							SectionStat.subLine(lyricAnnotations, sectionPtr, sectionCount, sectionsIn) :
							undefined,
						notesSubstitute: mappedNs,
						...this.subFCA({ fcaItems }, sectionPtr, sectionCount, sectionsIn),
						...others
					})
				})
				SectionStat.indexSort(lrcLines)
				// 统计布局权重
				mappedNotes.sections.forEach((section, sectionIndex) => {
					const weightProp = findWithKey(section.separator.before.attrs, 'type', 'weight') as AttrWeight
					if(weightProp) {
						sectionWeights[sectionIndex] = Math.max(sectionWeights[sectionIndex], weightProp.weight)
					}
					const paddingProp = findWithKey(section.separator.before.attrs, 'type', 'padding') as AttrPadding
					if(paddingProp) {
						sectionPadding[sectionIndex] = Math.max(sectionWeights[sectionIndex], paddingProp.padding)
					}
				})
				// 写入类型
				mappedNotes.head = part.headMap[sectionPtr]
				parts.push({
					lineNumber: part.lineNumber,
					signature: part.signature,
					decorations: part.decorations.filter((decor) => {
						return SectionStat.fieldOverlaps(field, [
							decor.startPos,
							decor.endPos
						])
					}),
					index: part.indexMap.slice(sectionPtr, sectionPtr + sectionCount),
					notes: mappedNotes,
					lyricLineSignatures: lrcSigs,
					lyricLines: lrcLines,
					noMargin: [false, false],
					...this.subFCA(part, sectionPtr, sectionCount, sectionsIn),
				})
			})
			SectionStat.indexSort(parts)
			sectionWeights.forEach((val, index) => {
				if(val == 0) {
					sectionWeights[index] = 1
				}
			})
			parts.forEach((part, index) => {
				function isCompactPart(part: LinedPart) {
					return part.notes.head == 'Na' || part.notes.head == 'Nc'
				}
				// 标记鼓点压行机制中要去掉的边距
				if(isCompactPart(part) && index != 0) {
					if(part.notes.head == 'Na') { // 鼓点行一律去除上边距
						part.noMargin[0] = true
					}
				}
				if(index != parts.length - 1) {
					const nextPart = parts[index + 1]
					if(isCompactPart(part) && isCompactPart(nextPart) && part.notes.head == nextPart.notes.head) {
						part.noMargin[1] = true
						nextPart.noMargin[0] = true
					}
				}
			})
			let startOrd = sectionPtr
			parts.forEach((part, index) => {
				if(part.notes.sections[0].type != 'nullish') {
					startOrd = part.notes.sections[0].ordinal
				}
			})
			lines.push({
				field: field,
				sectionWeights: sectionWeights,
				sectionPadding: sectionPadding,
				startOrdinal: startOrd,
				startSection: sectionPtr,
				sectionCountShould: sectionCountShould,
				timeLining: timeLining,
				sectionCount: sectionCount,
				partSignatures: sigs,
				parts: parts,
				jumpers: article.jumpers.filter((jumper) => {
					return SectionStat.sectionRangeOverlaps([ sectionPtr, sectionCount ], [
						jumper.startSection,
						jumper.endSection - jumper.startSection
					])
				}),
				sectionFields: article.sectionFields.slice(sectionPtr, sectionPtr + sectionCount),
			})

			sectionPtr += sectionCount
		}
		const { parts, ...other } = article
		return {
			lines: lines,
			...other
		}
	}
	subFCA(part: DestructedFCA, startSection: number, sectionCount: number, overwriteIdSections?: MusicSection<unknown>[]): DestructedFCA {
		return {
			fcaItems: part.fcaItems.sort((a,b) => {
				return a.index - b.index
			}).map((ann) => {
				return SectionStat.subLine(ann, startSection, sectionCount, overwriteIdSections)
			})
		}
	}
}
