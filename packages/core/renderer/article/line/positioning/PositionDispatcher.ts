import { NMNResult } from "../../../.."
import { MusicSection, NoteCharAny, sectionSeparatorInset } from "../../../../parser/sparse2des/types"
import { countArray, findIndexWithKey, findWithKey } from "@sparks-notation/util/array"
import { Frac, Fraction } from "@sparks-notation/util/frac"
import { DomPaint } from "../../../backend/DomPaint"
import { MusicPaint } from "../../../paint/MusicPaint"
import { RenderContext } from "../../../renderer"
import { addNotesScale, getLineFont } from "../font/fontMetrics"
import { FieldStatBuilder } from "./FieldStatBuilder"

type NMNLine = (NMNResult['result']['articles'][0] & {type: 'music'})['lines'][0]
const checkEps = 0.001

export const positionDispatcherStats = {
	computeTime: 0,
}

type SectionPositions = {
	/**
	 * 原本的边界位置
	 */
	realRange: [number, number]
	/**
	 * 边界位置
	 */
	range: [number, number]
	/**
	 * 边界边距
	 */
	padding: [number, number]
	/**
	 * 左边界和右边界的分数位置
	 */
	fraction: [Fraction, Fraction]
	/**
	 * 列及其限制条件
	 */
	columns: ColumnPosition[]
}
export type ColumnPosition = {
	/**
	 * 分数位置的签名
	 */
	hash: string
	/**
	 * 文本两侧占据排版空间的场宽（在边距内计算）
	 */
	field: [number, number]
	/**
	 * 文本两侧不占据排版空间，但是必须满足的场宽（可以与边距重叠，但不能超过边界）
	 */
	requiredField: [number, number]
	/**
	 * 是否将 requiredField 固化为 field
	 */
	rigid: [boolean, boolean]
	/**
	 * 分数位置
	 */
	fraction: Fraction
	/**
	 * 分配的位置
	 */
	position: number
}

/**
 * 列空间分配算法
 */
export class PositionDispatcher {
	root: DomPaint
	line: NMNLine
	context: RenderContext
	scale: number
	data: SectionPositions[] = []

	constructor(root: DomPaint, line: NMNLine, context: RenderContext, dispatch: boolean = true) {
		this.root = root
		this.line = line
		this.context = context
		this.scale = context.render.scale!
		if(dispatch) {
			this.dispatch()
		}
	}

	/**
	 * 获取起始位置
	 */
	startPosition(sectionIndex: number) {
		return this.data[sectionIndex].realRange[0]
	}
	/**
	 * 获取起始位置
	 */
	paddedStartPosition(sectionIndex: number) {
		return this.data[sectionIndex].realRange[0] + this.data[sectionIndex].padding[0]
	}
	/**
	 * 获取结束位置
	 */
	endPosition(sectionIndex: number) {
		return this.data[sectionIndex].realRange[1]
	}
	/**
	 * 获取结束位置
	 */
	paddedEndPosition(sectionIndex: number) {
		return this.data[sectionIndex].realRange[1] - this.data[sectionIndex].padding[1]
	}
	/**
	 * 获取分数位置的位置
	 */
	fracPosition(sectionIndex: number, frac: Fraction) {
		const columns = this.data[sectionIndex].columns
		const col = findWithKey(columns, 'hash', Frac.repr(frac))
		if(!col) {
			console.warn('My columns', this.data[sectionIndex].columns)
			throw new Error('Unknown column queried in PositionDispatcher ' + Frac.repr(frac) + ', in section ' + sectionIndex)
		}
		return col.position
	}
	/**
	 * 获取分数位置（或者其后的任意位置）在渲染行中的位置，如果不存在，返回最后一小节右边界位置
	 */
	fracEndPosition(frac: Fraction, isPrevious?: boolean) {
		let previous = this.paddedStartPosition(0)
		for(let section of this.data) {
			for(let column of section.columns) {
				if(Frac.compare(frac, column.fraction) <= 0) {
					return isPrevious ? previous : column.position
				}
				previous = column.position
			}
			// 这里使用右边界分数位置是不对的，因为它可能被修改过。好在目前没有。
			const endPos = section.realRange[1] - section.padding[1]
			if(Frac.compare(frac, section.fraction[1]) <= 0) {
				return isPrevious ? previous : endPos
			}
			previous = endPos
		}
		return this.paddedEndPosition(this.data.length - 1)
	}
	/**
	 * 获取分数位置的前间隙位置
	 */
	fracInsertPosition(sectionIndex: number, frac: Fraction, symbolOrdinal: number, totalSymbols: number) {
		const columns = this.data[sectionIndex].columns
		const colIndex = findIndexWithKey(columns, 'hash', Frac.repr(frac))
		const lastCol = columns[columns.length - 1]!
		let pos0 = 0
		let pos1 = 0
		if(-1 == colIndex) {
			if(Frac.compare(frac, lastCol.fraction) > 0) {
				pos1 = this.data[sectionIndex].range[1]
				pos0 = lastCol.position
			} else {
				throw new Error('Unknown column queried in PositionDispatcher, insert')
			}
		} else {
			const col = columns[colIndex]!
			pos1 = col.position
			if(colIndex > 0) {
				pos0 = columns[colIndex - 1].position
			} else {
				pos0 = this.data[sectionIndex].range[0]
			}
		}
		return pos0 + (pos1 - pos0) / (1 + totalSymbols) * (1 + symbolOrdinal)
	}

	/**
	 * 分配位置
	 */
	dispatch() {
		positionDispatcherStats.computeTime -= +new Date()
		this.dispatch$setSections()
		this.dispatch$statColumns()
		this.dispatch$compute()
		// console.log('Column slot', this.data)
		positionDispatcherStats.computeTime += +new Date()
	}
	/**
	 * 分配位置 - 统计小节
	 */
	dispatch$setSections() {
		const msp = new MusicPaint(this.root)
		const gutterLeft = this.context.render.gutter_left!
		const leftBoundary = gutterLeft * this.scale
		const rightBoundary = 100
		const sectionPadding = this.context.render.offset_section_boundary! * this.scale
		let weights = this.line.sectionWeights.slice()

		let currentStart = leftBoundary

		if(this.line.timeLining) {
			weights = weights.map((weight, index) => {
				let maxBeatCount = 0
				this.line.parts.forEach((part) => {
					const section = part.notes.sections[index]
					maxBeatCount = Math.max(
						maxBeatCount,
						(section.separator.after.attrs.filter(item => item.type == 'beats').length > 0 ? 1 : 0) +
						(section.separator.before.attrs.filter(item => item.type == 'beats').length > 0 ? 1 : 0)
					)
				})
				let beatWeight = Frac.toFloat(this.line.sectionFields[index][1]) + maxBeatCount * 0.25
				return weight * beatWeight
			})
		}
		if(this.context.render.note_count_lining!) {
			weights = weights.map((weight, index) => {
				let maxBeatCount = 0
				let maxNoteCount = 0
				this.line.parts.forEach((part) => {
					const section = part.notes.sections[index]
					maxBeatCount = Math.max(
						maxBeatCount,
						(section.separator.after.attrs.filter(item => item.type == 'beats').length > 0 ? 1 : 0) +
						(section.separator.before.attrs.filter(item => item.type == 'beats').length > 0 ? 1 : 0)
					)
					if(section.type == 'section') {
						// 暂时不含替代旋律
						maxNoteCount = Math.max(maxNoteCount, section.notes.length)
					}
				})
				let beatWeight = Math.min(1.35, 1 + maxNoteCount * 0.03 + maxBeatCount * 0.05)
				return weight * beatWeight
			})
		}

		let totalWeights = 0
		weights.forEach((weight) => {
			totalWeights += weight
		})
		if(this.line.timeLining! && this.line.sectionCount > 0) {
			totalWeights += totalWeights / this.line.sectionCount * (this.line.sectionCountShould - this.line.sectionCount)
		} else {
			totalWeights += this.line.sectionCountShould - this.line.sectionCount
		}
		
		this.line.sectionFields.forEach((fields, index) => {
			let currentEnd = currentStart + (rightBoundary - leftBoundary) / totalWeights * weights[index]
			const [ rangeL, rangeR ] = [ currentStart, currentEnd ]
			currentStart = currentEnd
			let localPadding = this.line.sectionPadding[index]
			const newSec: SectionPositions = {
				realRange: [rangeL, rangeR],
				range: [rangeL, rangeR],
				padding: [ sectionPadding + localPadding, sectionPadding + localPadding ],
				fraction: [ Frac.sub(fields[0], Frac.create(1, 2)), Frac.add(fields[0], fields[1]) ], // 开头扩展半个四分音符的位置，以调和“极不自然”的不对称性
				columns: [],
			}
			let beforeBeatsWidth = 0
			let afterBeatsWidth = 0
			let maxInset = [0, 0]
			this.line.parts.forEach((part) => {
				const section = part.notes.sections[index]
				const beforeAttrs = section.separator.before.attrs
				const afterAttrs = section.separator.after.attrs
				const beforeBeats = findWithKey(beforeAttrs, 'type', 'beats')
				if(beforeBeats) {
					if(beforeBeats.type != 'beats') throw new Error('strange!')
					beforeBeatsWidth = Math.max(beforeBeatsWidth,
						msp.drawBeats(0, 0, beforeBeats.beats, 0.95, this.scale, {}, true)[0] + this.scale * 0.5
					)
				}
				const afterBeats = findWithKey(afterAttrs, 'type', 'beats')
				if(afterBeats) {
					if(afterBeats.type != 'beats') throw new Error('strange!')
					afterBeatsWidth = Math.max(afterBeatsWidth,
						msp.drawBeats(0, 0, afterBeats.beats, 0.95, this.scale, {}, true)[0] + this.scale * 0.5
					)
				}
				const separatorInset = sectionSeparatorInset(section.separator, index == 0)
				maxInset = [
					Math.max(maxInset[0], separatorInset[0]),
					Math.max(maxInset[1], separatorInset[1])
				]
			})
			
			if(beforeBeatsWidth != 0) {
				newSec.range[0] += beforeBeatsWidth + maxInset[0] * this.scale
			} else if(index == 0) {
				newSec.range[0] += maxInset[0] * this.scale * 0.75
			}
			if(afterBeatsWidth != 0) {
				newSec.range[1] -= afterBeatsWidth + maxInset[1] * this.scale
			}
			this.data.push(newSec)
		})
	}
	/**
	 * 分配位置 - 统计布局列
	 */
	dispatch$statColumns() {
		const builder = new FieldStatBuilder(this.line.sectionCount, this.line.sectionFields, this.context.render.legacy_positioning!)
		const msp = new MusicPaint(this.root)
		const handleSections = (rowHash: string, sections: MusicSection<NoteCharAny>[] | undefined, isMusic: boolean, isSmall: boolean, rangeStart: number = 0) => {
			if(!sections) {
				return
			}
			
			const noteCharMeasure = msp.measureNoteChar(this.context, isSmall, this.scale)
			const addNoteCharMeasure = [noteCharMeasure[0] * addNotesScale, noteCharMeasure[1] * addNotesScale]

			const accidentalCharMetric = getLineFont(isSmall ? 'accidentalSmall' : 'accidental', this.context)
			
			sections.forEach((section, sectionIndex) => {
				const actualIndex = sectionIndex + rangeStart
				if(actualIndex < 0 || actualIndex > this.line.sectionFields.length) {
					return
				}
				if(section.type != 'section') {
					return
				}
				section.notes.forEach((note) => {
					const fracPos = Frac.add(this.line.sectionFields[actualIndex][0], note.startPos)
					if(isMusic) {
						let accidentalSymbol = ''
						let hasSlideUp = false
						let hasSlideDown = false
						let leftAddCount = -1
						let rightAddCount = -1
						let dotCount = 0
						if(note.type == 'note' || note.type == 'extend') {
							if(note.type == 'note') {
								const noteChar = note.char
								if(noteChar.type != 'music') {
									throw new Error('Position dispatching occured with a non-music note.')
								}
								if(noteChar.delta == noteChar.delta) {
									accidentalSymbol = msp.symbolAccidental(noteChar.delta)
								}
							}
							for(let attr of note.attrs) {
								if(attr.type == 'notes') {
									if(attr.slot == 'prefix') {
										leftAddCount = attr.notes.type == 'section' ? attr.notes.notes.length : 0
									} else if(attr.slot == 'postfix') {
										rightAddCount = attr.notes.type == 'section' ? attr.notes.notes.length : 0
									}
								} else if(attr.type == 'slide') {
									if(attr.direction == 'up') {
										hasSlideUp = true
									} else {
										hasSlideDown = true
									}
								}
							}
							dotCount = countArray(note.suffix, '.')
						}

						const leftAddWidth = leftAddCount * addNoteCharMeasure[0]
						const rightAddWidth = rightAddCount * addNoteCharMeasure[0]
						const addNotesHandleWidth = noteCharMeasure[1] * this.scale * 0.3
						const slideHandleWidth = noteCharMeasure[1] * this.scale * 0.45

						const normalCharWidthRatio = 1.1
						builder.writeConstraint(rowHash, fracPos, actualIndex, [
							noteCharMeasure[0] / 2 * 1,
							noteCharMeasure[0] / 2 * 1
						], true) // 音符本身占据排版域
						builder.writeConstraint(rowHash, fracPos, actualIndex, [
							noteCharMeasure[0] / 2 * normalCharWidthRatio,
							noteCharMeasure[0] / 2 * normalCharWidthRatio
						], false) // 音符本身占据排版域
						builder.writeConstraint(rowHash, fracPos, actualIndex, [
							(
								noteCharMeasure[0] / 2 +
								this.root.measureTextFast(accidentalSymbol, accidentalCharMetric, this.scale)[0] +
								(leftAddCount == -1 ? (0) : (
									leftAddWidth / 2 +
									Math.max(addNotesHandleWidth, leftAddWidth / 2)
								))
							),
							noteCharMeasure[0] / 2 + Math.max(
								(
									noteCharMeasure[0] / 2 * dotCount
								), rightAddCount == -1 ? (0) : (
									rightAddWidth / 2 +
									Math.max(addNotesHandleWidth, rightAddWidth / 2)
								), (
									(+(hasSlideUp || hasSlideDown)) * slideHandleWidth * 1.2  // 箭头还需要额外宽度
								)
							)
						], false) // 音符的附加符号（升降调、装饰音、滑音）的排版空间必须满足，但不需要参与计算
					} else {
						if(note.type != 'extend' && !('void' in note.char)) {
							builder.writeConstraint(rowHash, fracPos, actualIndex, [0, 0], false) // 标记内容不参与自动排版，但是保留席位
						}
					}
				})
			})
		}
		this.line.parts.forEach((part, partIndex) => {
			handleSections(`part-notes-${partIndex}`, part.notes.sections, true, false)
			part.fcaItems.forEach((ann, annIndex) => {
				handleSections(`part-annotation-${partIndex}-${annIndex}`, ann.sections, false, false)
			})
			part.lyricLines.forEach((lrcLine, lrcLineIndex) => {
				// 歌词占位推断
				lrcLine.sections.forEach((lrcSection, sectionIndex) => {
					if(lrcSection.type != 'section') {
						return
					}
					const chars = lrcSection.chars
					chars.forEach((char, charIndex) => {
						const lrcMetric = getLineFont('lyrics', this.context)
						if(char.occupiesSpace) {
							const boundaries = msp.drawLyricChar(this.context, 0, 0, char, 'center', this.scale, {}, true)
							let rpt = charIndex + 1
							while(true) {
								const rChar = chars[rpt]
								if(rChar === undefined || rChar.occupiesSpace) {
									break
								}
								rpt += 1
							}
							for(let i = charIndex + 1; i < rpt; i++) {
								// 此部分为连接标点留出空间
								const char2 = chars[i]
								boundaries[1] += msp.drawLyricChar(this.context, 0, 0, char2, 'left', this.scale, {}, true)[1]
							}
							let lm = 0
							let rm = 0
							const dm = this.root.measureTextFast('a', lrcMetric, this.scale)[0] / 2
							// 词基歌词的单词左右需要留空位，防止单词粘连。
							if(!char.isCharBased) {
								const preChar = chars[charIndex - 1]
								if(!char.prefix && preChar && preChar.occupiesSpace) {
									lm = dm
								}
								const postChar = chars[charIndex + 1]
								if(!char.postfix && postChar && postChar.occupiesSpace) {
									rm = dm
								}
							}
							builder.writeConstraint(`lyric-${partIndex}-${lrcLineIndex}`, Frac.add(lrcSection.startPos, char.startPos), sectionIndex, [
								-boundaries[0] + lm,
								boundaries[1] + rm
							], false)
						}
					})
				})
				handleSections(`lyric-${partIndex}-${lrcLineIndex}`, lrcLine.lyricAnnotations?.sections, false, false)
				lrcLine.fcaItems.forEach((ann, annIndex) => {
					handleSections(`lyric-annotation-${partIndex}-${lrcLineIndex}-${annIndex}`, ann.sections, false, false)
				})
				lrcLine.notesSubstitute.forEach((Ns) => {
					handleSections(`lyric-substitute-${partIndex}-${lrcLineIndex}`, Ns.sections, true, true, Ns.substituteLocation)
				})
			})
		})
		// 获取数据
		const acquiredData = builder.compute()
		for(let sectionIndex = 0; sectionIndex < this.line.sectionCount; sectionIndex++) {
			this.data[sectionIndex].columns = acquiredData[sectionIndex].map(column => ({
				hash: column.hash,
				field: column.field,
				requiredField: column.requiredField,
				fraction: column.fraction,
				position: this.data[sectionIndex].range[0],
				rigid: [false, false]
			}))
		}
	}
	/**
	 * 分配位置 - 计算布局
	 */
	dispatch$compute() {
		this.line.sectionFields.forEach((_, sectionIndex) => {
			const attempDispatch = () => {
				const data = this.data[sectionIndex]
				
				// ===== 统计权重 =====
				let totalSpare = data.range[1] - data.range[0]
				const weights: Fraction[] = []
				for(let i = 0; i < data.columns.length; i++) {
					// 间隙 0 ~ L - 1
					let prevFrac = data.fraction[0]
					const isRigid = data.columns[i].rigid[0]
					if(i > 0) {
						prevFrac = data.columns[i - 1].fraction
					}
					if(isRigid) {
						weights.push(Frac.create(0))
					} else {
						weights.push(Frac.sub(data.columns[i].fraction, prevFrac))
					}
					// 计算总空间
					if(i > 0) {
						if(isRigid) {
							totalSpare -= Math.max(data.columns[i].field[0], data.columns[i].requiredField[0])
							totalSpare -= Math.max(data.columns[i - 1].field[1], data.columns[i - 1].requiredField[1])
						} else {
							totalSpare -= data.columns[i].field[0] + data.columns[i - 1].field[1]
						}
					} else {
						if(isRigid) {
							// 左边沿已经固化，不计算边距空间
							totalSpare -= Math.max(data.padding[0] + data.columns[i].field[0], data.columns[i].requiredField[0])
						} else {
							totalSpare -= data.padding[0] + data.columns[i].field[0]
						}
					}
				}
				// 间隙 L
				let lastColumn = data.columns[data.columns.length - 1]!
				if(lastColumn.rigid[1]) {
					totalSpare -= Math.max(data.padding[1] + lastColumn.field[1], lastColumn.requiredField[1])
					weights.push(Frac.create(0))
				} else {
					totalSpare -= data.padding[1] + lastColumn.field[1]
					weights.push(Frac.sub(data.fraction[1], lastColumn.fraction))
				}
				const totalWeight = Frac.sum(...weights)
				// ===== 分配位置 =====
				let currentPos = data.range[0]
				for(let i = 0; i < data.columns.length; i++) {
					let isRigid = data.columns[i].rigid[0]
					if(isRigid) {
						if(i > 0) {
							currentPos += data.columns[i].requiredField[0]
						} else {
							currentPos += Math.max(data.padding[0] + data.columns[i].field[0], data.columns[i].requiredField[0])
						}
					} else {
						if(i == 0) {
							currentPos += data.padding[0]
						}
						currentPos += data.columns[i].field[0]
						currentPos += totalSpare / Frac.toFloat(totalWeight) * Frac.toFloat(weights[i])
					}
					data.columns[i].position = currentPos
					isRigid = data.columns[i].rigid[1]
					if(isRigid) {
						currentPos += data.columns[i].requiredField[1]
					} else {
						currentPos += data.columns[i].field[1]
					}
				}
			}
			const checkRequired = (): 'pass' | 'dead' | 'continue' => {
				const data = this.data[sectionIndex]
				
				// 完成：所有条件被满足
				// 没救了：被固化的条件仍然无法满足（此时在不固化任何条件的情况下再分配一次即结束）
				let needContinue = false
				let lastPos = data.range[0]
				for(let i = 0; i < data.columns.length; i++) {
					const isRigid = data.columns[i].rigid[0]
					let requiredField = data.columns[i].requiredField[0]
					if(i > 0) {
						requiredField += data.columns[i - 1].requiredField[1]
					}
					const currPos = data.columns[i].position
					if(currPos - lastPos + checkEps < requiredField) {
						if(isRigid) {
							return 'dead'
						} else {
							data.columns[i].rigid[0] = true
							if(i > 0) {
								data.columns[i - 1].rigid[1] = true
							}
							needContinue = true
						}
					}
					lastPos = currPos
				}
				const currPos = data.range[1]
				let lastColumn = data.columns[data.columns.length - 1]!
				const isRigid = lastColumn.rigid[1]
				if(currPos - lastPos + checkEps < lastColumn.requiredField[1]) {
					if(isRigid) {
						return 'dead'
					} else {
						lastColumn.rigid[1] = true
						needContinue = true
					}
				}
				if(needContinue) {
					return 'continue'
				} else {
					return 'pass'
				}
			}
			const clearRigid = () => {
				const data = this.data[sectionIndex]
				data.columns.forEach((col) => {
					col.rigid[0] = col.rigid[1] = false
				})
			}
			let iters = 0
			clearRigid()
			while(true) {
				attempDispatch()
				const ch = checkRequired()
				if(ch == 'pass') {
					return
				} else if(ch == 'dead') {
					clearRigid()
					attempDispatch()
					break
				}
			}
		})
	}
}
