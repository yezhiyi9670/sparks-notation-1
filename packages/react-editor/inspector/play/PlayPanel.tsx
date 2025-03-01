import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { IntegratedEditorContext } from '../../IntegratedEditor'
import { createUseStyles } from 'react-jss'
import { Button, ButtonGroup, ButtonMargin, ButtonSpacer } from '../component/button'
import { NMNI18n, NMNResult } from '@sparks-notation/core'
import { ModifierControls } from './modifier/ModifierControls'
import { ArticleSelector } from './selector/ArticleSelector'
import { IterationSelector } from './selector/IterationSelector'
import { PartSignature } from '@sparks-notation/core/parser/des2cols/types'
import { useMethod } from '@sparks-notation/util/hook'
import { SectionSelector } from './overview/SectionSelector'
import { DomUtils } from '@sparks-notation/util/dom'
import { RenderSectionPickCallback } from '@sparks-notation/core/renderer/renderer'
import { SequenceSectionStat } from '@sparks-notation/core/parser/sequence/SequenceSectionStat'
import { BeatMachineSignature, ControlData, MixingControlUtils, controlDataPartBeatMachine, controlDataPartDefault } from '../../tone/ControlData'
import { Controls } from './control/Controls'
import { useOnceEffect } from '@sparks-notation/util/event'
import { MetaCommentWriter } from '@sparks-notation/core/meta-comment-writer/MetaCommentWriter'
import { PlayerComponent } from './player/PlayerComponent'
import { RenderAudio } from './player/RenderAudio'

import * as Icons from 'react-icons/vsc'
import * as IconsPi from 'react-icons/pi'
import { randomToken } from '@sparks-notation/util/random'

const useStyles = createUseStyles({
	headroom: {
		flexShrink: 0,
		borderBottom: '1px solid #0004',
		padding: '12px'
	},
	contentroom: {
		flex: 'auto',
		overflowY: 'auto',
		display: 'flex',
		flexDirection: 'column',
		height: 0,
	},
	modifierRoom: {
		flexShrink: 0,
		borderBottom: '1px solid #0004',
		padding: '12px',
		display: 'flex',
		flexDirection: 'row',
		'&>div': {
			flex: 'auto',
			flexBasis: 0
		},
		fontSize: '15px'
	},
	selectorRoom: {
		flexShrink: 0,
		// borderBottom: '1px solid #0002',
		paddingTop: '12px'
	},
	overviewRoom: {
		flexShrink: 0,
		borderBottom: '1px solid #0004',
		fontSize: '12px' // 用于减缓滚动
	},
	controlRoom: {
		flexShrink: 0,
		padding: '0 12px',
		fontSize: '12px' // 用于减缓滚动
	}
})

function recreateControlData(result: NMNResult, previous?: ControlData) {
	const partHashes: {[partHash: string]: boolean} = {}
	const newData: ControlData = {}
	function handleSignature(signature: PartSignature | BeatMachineSignature) {
		const hash = signature.hash
		if(!partHashes[hash]) {
			partHashes[hash] = true
			if(previous && previous[hash]) {
				newData[hash] = {
					...previous[hash],
					signature: signature,
				}
			} else {
				newData[hash] = {
					control: signature.type == 'beatMachine' ? { ...controlDataPartBeatMachine } : { ...controlDataPartDefault },
					signature: signature,
				}
				if(signature.type != 'beatMachine' && signature.head == 'Na') {
					newData[hash].control.drumlineInstrument = 'drum'
				}
			}
		}
	}
	handleSignature({
		type: 'beatMachine',
		hash: 'beatMachine'
	})
	for(let article of result.sequenced.score.articles) {
		if(article.type != 'music') {
			continue
		}
		for(let part of article.parts) {
			handleSignature(part.signature)
		}
	}
	return newData
}

// eslint-disable-next-line react/display-name
export const PlayPanel = React.memo(function(props: {
	result: NMNResult
	onNoteHighlightUpdate: (val: string[]) => void
	onAutoScroll: (val: string) => void
	pickingSections: boolean
	onTogglePicker: (state: boolean) => void
	getPickReporter: React.MutableRefObject<RenderSectionPickCallback | null>
	onExportFinish?: (flacData: Uint8Array) => void

	// 传递原始代码是为了实现混音设置的保存功能
	code: string
	setCode: (val: string) => void

	// 传递由编辑器管理的导出状态
	exporting: string
	setExporting: (val: string) => void
	exportProgress: [number, number]
	setExportProgress: (val: [number, number]) => void
}) {
	const { prefs, language, colorScheme } = useContext(IntegratedEditorContext)
	const classes = useStyles()
	const divRef = useRef<HTMLDivElement>(null)

	// 提取音乐章节列表以及序列
	const [ musicArticleIndexes, articles, sequences ] = useMemo(() => {
		return [
			props.result.sequenced.score.articles.map((article, index) => {
				return index
			}).filter(index => props.result.sequenced.score.articles[index].type == 'music'),
			props.result.sequenced.score.articles,
			props.result.sequenced.sequence
		]
	}, [props.result])

	// ===== BEGIN STATES =====

	const [ playing, setPlaying ] = useState(false)
	const updatePlaying = useMethod((val: boolean) => {
		setPlaying(val)
	})
	const [ preSection, setPreSection ] = useState(false)
	const updatePreSection = useMethod(setPreSection)

	const [ autoScroll, setAutoScroll ] = useState(true)

	const [ speedModifier, setSpeedModifier ] = useState(1)
	const [ pitchModifier, setPitchModifier ] = useState(0)
	
	const [ articleIndex, setArticleIndex ] = useState(-1)
	const updateArticleIndex = useMethod(setArticleIndex)
	const [ iterationIndex, setIterationIndex ] = useState(-1)
	const updateIterationIndex = useMethod(setIterationIndex)
	const [ sectionIndex, setSectionIndex ] = useState(-1)
	const updateSectionIndex = useMethod(setSectionIndex)

	const [ controlData, setControlData ] = useState(() => recreateControlData(props.result))
	const getControlData = useMethod(() => {
		return controlData
	})
	const resetControlData = useMethod((newData: ControlData) => {
		setControlData(newData)
	})
	const updateControlData = useMethod(setControlData)

	const { exporting, setExporting, exportProgress, setExportProgress } = props
	const getExporting = useMethod(() => exporting)
	const getExportProgress = useMethod(() => exportProgress)

	// ===== END STATES =====

	// 重建 controlData
	useMemo(() => {
		resetControlData(recreateControlData(props.result, getControlData()))
	}, [props.result, resetControlData, getControlData])

	// 高亮音符
	const lastHighlight = useRef<string | null>(null)
	const lastUpdateTime = useRef(+new Date())
	useEffect(() => {
		lastHighlight.current = null
		lastUpdateTime.current = +new Date()
	}, [props.result])
	const updateNoteHighlight = useMethod((val: string[]) => {
		if(val.length > 0) {
			lastHighlight.current = val[val.length - 1]
			if(autoScroll && +new Date() - lastUpdateTime.current >= 500) {
				props.onAutoScroll(lastHighlight.current)
			}
		}
		props.onNoteHighlightUpdate(val)
	})
	const updatePicker = useMethod((val: boolean) => {
		props.onTogglePicker(val)
	})
	useEffect(() => {
		return () => {
			// 清除高亮
			updateNoteHighlight([])
			updatePicker(false)
		}
	}, [updateNoteHighlight, updatePicker])

	// 寻找章节
	const [ article, sequence ] = useMemo(() => {
		let index = articleIndex
		if(musicArticleIndexes.indexOf(index) == -1) {
			if(musicArticleIndexes.length == 0) {
				return [ undefined, undefined ]
			}
			setArticleIndex(index = musicArticleIndexes[0])
		}
		const article = articles[index]
		if(article.type != 'music') {
			return [ undefined, undefined ]
		}
		return [ article, sequences[index]! ]
	}, [articles, musicArticleIndexes, articleIndex, sequences])
	// 寻找迭代节
	const iteration = useMemo(() => {
		if(!sequence) {
			return undefined
		}
		let index = iterationIndex
		if(index < 0 || index >= sequence.iterations.length) {
			if(sequence.iterations.length == 0) {
				return undefined
			}
			setIterationIndex(index = 1)
		}
		return sequence.iterations[index]
	}, [iterationIndex, sequence])
	// 寻找小节
	const [ sequenceSection, indexInSequence ] = useMemo(() => {
		if(!iteration) {
			return [ undefined, -1 ]
		}
		let index = sectionIndex
		let indexIn = 0
		for(let section of iteration.sections) {
			if(section.index == index) {
				return [ section, indexIn ]
			}
			indexIn += 1
		}
		if(iteration.sections.length == 0) {
			return [ undefined, -1 ]
		}
		setSectionIndex(index = iteration.sections[0].index)
		return [ iteration.sections[0], 0 ]
	}, [iteration, sectionIndex])
	// 计算高亮区
	const computeNoteHighlight = useMethod(() => {
		if(!sequenceSection) {
			updateNoteHighlight([])
			return
		}
		const highlights: string[] = []
		for(let partId in sequenceSection.parts) {
			const part = sequenceSection.parts[partId]
			if(part.section.type != 'section') {
				continue
			}
			for(let note of part.section.notes) {
				highlights.push(note.uuid)
			}
		}
		updateNoteHighlight(highlights)
	})
	// 更新高亮区
	useEffect(() => {
		if(!playing) {
			computeNoteHighlight()
		}
	}, [sequenceSection, computeNoteHighlight, playing])

	// 自动滚动·Iteration
	const iterationDivRef = useRef<HTMLDivElement>(null)
	useEffect(() => {
		if(iterationDivRef.current) {
			const outBox = iterationDivRef.current
			const inBox = DomUtils.findChildrenWithAttr(outBox, 'data-index', iterationIndex)
			if(!inBox) {
				return
			}
			DomUtils.smoothScrollFor(outBox, inBox, 'left')
		}
	}, [iterationIndex])
	// 自动滚动·Section
	const sectionDivRef = useRef<HTMLDivElement>(null)
	useEffect(() => {
		if(sectionDivRef.current) {
			const outBox = sectionDivRef.current
			const inBox = DomUtils.findChildrenWithAttr(
				DomUtils.findChildrenWithAttr(
					DomUtils.findChildrenWithAttr(
						outBox,
						'data-tag', 'container'
					),
					'data-tag', 'containerIn'
				), 'data-index', sectionIndex
			)
			if(!inBox) {
				return
			}
			DomUtils.scrollToMakeVisible(outBox, inBox, 'top', -32, 0.4)
		}
	}, [sectionIndex])

	// 小节选择器
	props.getPickReporter.current = (articleId, section) => {
		const result = SequenceSectionStat.locateSection(sequences, articleId, iterationIndex, section.idCard.uuid)
		lastUpdateTime.current = +new Date()
		setArticleIndex(result.article)
		setIterationIndex(result.iteration)
		setSectionIndex(result.section)
		if(divRef.current) {
			divRef.current.focus()
		}
	}

	// 混音设置导出
	const mixingMetaName = 'SparksNMN.MIDIPlay.MixingConfig'
	const saveMixingConfig = useMethod(() => {
		const newCode = MetaCommentWriter.writeMeta(
			props.code, mixingMetaName, MixingControlUtils.dehydrate(controlData),
			NMNI18n.editorText(language, 'inspector.play.controls.remark')
		)
		if(newCode != props.code) {
			props.setCode(newCode)
		}
	})
	const loadMixingConfig = useMethod(() => {
		const readData = MetaCommentWriter.readMeta(props.code, mixingMetaName)
		if(!readData) {
			return
		}
		setControlData(MixingControlUtils.revive(controlData, readData))
	})
	const canLoadMixingConfig = useMemo(() => {
		return MetaCommentWriter.hasMeta(props.code, mixingMetaName)
	}, [props.code])
	useOnceEffect(() => {
		if(canLoadMixingConfig) {
			loadMixingConfig()
		}
	})

	// 播放事件
	function play(usePreSection: boolean) {
		updatePlaying(true)
		updatePreSection(usePreSection)
		props.onTogglePicker(false)
	}
	function stopPlaying() {
		setPlaying(false)
		setPreSection(false)
	}
	function resetProgress() {
		updateIterationIndex(1)
		updateSectionIndex(0)
	}
	function toggleAutoScroll() {
		if(!autoScroll) {
			if(lastHighlight.current !== null) {
				props.onAutoScroll(lastHighlight.current)
			}
		}
		setAutoScroll(s => !s)
	}
	const updatePlayerNoteHighlight = useMethod((val: string[]) => {
		if(playing) {
			updateNoteHighlight(val)
		}
	})
	// 渲染并导出。这里采用 exportingRef 检验组件状态——如果组件卸载即中断操作。
	const exportCanceller = useRef<() => void>(() => {})
	async function renderAndExport() {
		if(exporting) {
			stopExport()
			return
		}
		if(!sequence) {
			return
		}
		const token = randomToken(12)
		setExporting(token)
		setExportProgress([0, 1])
		const finishCallback = props.onExportFinish

		const renderRet = RenderAudio.renderAudio(
			sequence, controlData, speedModifier, pitchModifier, iterationIndex, prefs.instrumentSourceUrl!,
			() => token == getExporting(),
			(finished, total) => {
				if(token != getExporting()) {
					return
				}
				setExportProgress([finished, total])
			}
		)
		exportCanceller.current = renderRet.cancel
		const encData = await renderRet.promise

		setExporting('')
		exportCanceller.current = () => {}

		if(!encData) {
			return
		}

		setPlaying(false)
		
		finishCallback && finishCallback(encData)
	}
	// 取消导出（会试图终止后台运算）
	async function stopExport() {
		exportCanceller.current()
		setExporting('')
	}
	// 导出进度
	let exportProgressText = (exportProgress[0] / exportProgress[1] * 100).toFixed(0)
	if(exportProgressText == '100') {
		exportProgressText = NMNI18n.editorText(language, 'inspector.play.render.progress.encoding')
	} else {
		exportProgressText = NMNI18n.editorText(language, 'inspector.play.render.progress.rendering', exportProgressText)
	}

	// 键盘事件
	const handleKeyDown = (evt: React.KeyboardEvent) => {
		let hasAction = true
		// 调整进度
		if(!evt.ctrlKey && (evt.key == 'ArrowLeft' || evt.key == 'ArrowRight')) {
			evt.preventDefault()
			const sign = evt.key == 'ArrowLeft' ? -1 : 1
			if(evt.shiftKey) {
				const newIndex = iterationIndex + sign
				if(!sequence || newIndex < 0 || newIndex >= sequence.iterations.length) {
					return
				}
				setIterationIndex(newIndex)
			} else {
				const newIndex = indexInSequence + sign
				if(!iteration || newIndex < 0 || newIndex >= iteration.sections.length) {
					return
				}
				setSectionIndex(iteration.sections[newIndex].index)
			}
		}
		// 重新开始
		else if(!evt.ctrlKey && evt.key.toLowerCase() == 'r') {
			resetProgress()
		}
		// 自动滚动
		else if(!evt.ctrlKey && evt.key.toLowerCase() == 'a') {
			toggleAutoScroll()
		}
		// 自动播放
		else if(!evt.ctrlKey && evt.key.toLowerCase() == 'k') {
			if(playing) {
				setPlaying(false)
			} else {
				if(canPlay) {
					setPlaying(true)
					setPreSection(false)
				}
			}
		}
		else {
			hasAction = false
		}
		if(hasAction) {
			if(divRef.current) {
				divRef.current.focus()
			}
		}
	}

	const canPlay = (prefs.instrumentSourceUrl !== undefined) && sequenceSection !== undefined

	return <div
		style={{flex: 'auto', display: 'flex', flexDirection: 'column'}}
		onKeyDown={handleKeyDown}
		ref={divRef}
		tabIndex={0}
	>
		<PlayerComponent
			playing={playing} setPlaying={updatePlaying}
			preSection={preSection} setPreSection={updatePreSection}
			sequence={sequence!}
			controlData={controlData}
			iterationIndex={iterationIndex}
			setIterationIndex={updateIterationIndex}
			sectionIndex={sectionIndex}
			setSectionIndex={updateSectionIndex}

			speedModifier={speedModifier}
			pitchModifier={pitchModifier}

			updateNoteHighlight={updatePlayerNoteHighlight}
		/>
		<div className={classes.headroom} style={{...(!prefs.isMobile && {borderBottom: 'none', paddingBottom: 0})}}>
			<ButtonGroup>
				<Button
					title={NMNI18n.editorText(language, 'inspector.play.play')}
					onClick={() => play(false)}
					selected={playing && !preSection}
					disabled={(playing && preSection) || !canPlay}
				>
					<Icons.VscPlay style={{transform: 'translateY(0.13em)'}} />
				</Button>
				<ButtonMargin />
				<Button
					title={NMNI18n.editorText(language, 'inspector.play.play_pre')}
					onClick={() => play(true)}
					selected={playing && preSection}
					disabled={(playing && !preSection) || !canPlay}
				>
					<Icons.VscDebugContinueSmall style={{transform: 'translateY(0.13em)'}} />
				</Button>
				<ButtonMargin />
				<Button
					title={NMNI18n.editorText(language, 'inspector.play.pause')}
					onClick={() => stopPlaying()}
					selected={!playing}
				>
					<Icons.VscDebugPause style={{transform: 'translateY(0.13em)'}} />
				</Button>
				<ButtonMargin />
				<Button title={NMNI18n.editorText(language, 'inspector.play.stop')} onClick={() => resetProgress()}>
					<Icons.VscRefresh style={{transform: 'translateY(0.13em)'}} />
				</Button>
				<ButtonMargin />
				<Button
					title={NMNI18n.editorText(language, 'inspector.play.auto_scroll')}
					selected={autoScroll}
					onClick={() => toggleAutoScroll()}
				>
					<Icons.VscFoldDown style={{transform: 'translateY(0.13em)'}} />
				</Button>
				<ButtonSpacer />
				<Button
					onClick={() => renderAndExport()}
					selected={exporting != ''}
					disabled={!canPlay && !exporting}
					style={{fontSize: '15px'}}
					title={exporting ? NMNI18n.editorText(language, 'inspector.play.render.tooltip.progress') : NMNI18n.editorText(language, 'inspector.play.render.tooltip.idle')}
				>
					<span style={{paddingRight: '0.4em'}}>
						{exporting ? (
							exportProgressText
						) : (
							NMNI18n.editorText(language, 'inspector.play.render.idle')
						)}
					</span>
					<IconsPi.PiFileAudio style={{transform: 'translateY(0.1em) scale(1.1)', fontSize: '1.2em'}} />
				</Button>
			</ButtonGroup>
		</div>
		<div className={classes.contentroom} style={{...(!prefs.isMobile && {flexShrink: 0, height: '', overflowY: 'hidden'})}}>
			<div className={classes.modifierRoom}>
				<ModifierControls
					speed={speedModifier}
					pitch={pitchModifier}
					onSpeedChange={setSpeedModifier}
					onPitchChange={setPitchModifier}
				/>
			</div>
			<div className={classes.selectorRoom}>
				<ArticleSelector
					articles={articles}
					sequence={sequences}
					value={articleIndex}
					onChange={updateArticleIndex}
					pickingSections={props.pickingSections}
					onTogglePicker={() => updatePicker(!props.pickingSections)}
					playing={playing}
				/>
				{article &&
					<IterationSelector
						article={article}
						sequence={sequence!}
						value={iterationIndex}
						onChange={updateIterationIndex}
						ref={iterationDivRef}
					/>
				}
			</div>
			<div ref={sectionDivRef} className={classes.overviewRoom} style={{...(!prefs.isMobile && {flex: 3, height: 0, overflowY: 'auto'})}}>
				{article && iteration &&
					<SectionSelector
						article={article}
						iteration={iteration}
						value={sectionIndex}
						onChange={updateSectionIndex}
					/>
				}
			</div>
			<div className={classes.controlRoom} style={{...(!prefs.isMobile && {flex: 4, height: 0, overflowY: 'auto'})}}>
				<Controls
					data={controlData}
					setData={updateControlData}
					onSaveData={saveMixingConfig}
					onLoadData={loadMixingConfig}
					canLoadData={canLoadMixingConfig}
					playing={playing}
				/>
			</div>
		</div>
	</div>
})
