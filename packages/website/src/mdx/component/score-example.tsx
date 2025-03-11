import Link from "@docusaurus/Link"
import React, { ReactNode, createRef, useEffect, useState } from "react"
import { usePlaygroundUrl, playgroundStoreKey } from "./playground"
import * as Icons from 'react-icons/fa'
import { createUseStyles } from "react-jss"
import { Util } from "../util/util"
import { NMNDisplay } from "../nmn-live/NMNDisplay"
import CodeBlock from '@theme/CodeBlock'
import BrowserOnly from "@docusaurus/BrowserOnly"

const useStyles = createUseStyles({
	container: {
		margin: '1.5em 0',
		boxShadow: 'var(--ifm-global-shadow-lw)',
		borderRadius: 'var(--ifm-alert-border-radius)',
		background: '#f6f8fa',
		// border: '1px solid #0002'
	},
	title: {
		fontWeight: 700,
		padding: '8px 12px',
		borderBottom: '1px solid #0002'
	},
	delimiter: {
		borderBottom: '1px solid #0002'
	},
	PreviewBox: {
		padding: '8px 0',
		paddingTop: '12px',
	},
	CodeBox: {
		'&>div': {
			boxShadow: 'none !important',
			borderRadius: 0,
			'--prism-background-color': 'transparent !important',
			marginBottom: 0
		}
	},
	CodeControlsBox: {
		padding: '8px 12px'
	}
})

function transformEfRange(efRange?: string | number | (string | number)[]): [string, string] | undefined {
	if(efRange == undefined) {
		return efRange as undefined
	}
	const tr = (thing: number | string) => {
		if(typeof(thing) == 'number') {
			return 'musicLine--' + thing
		}
		return thing
	}
	return (
		typeof(efRange) == 'object' ?
			[tr(efRange[0]), tr(efRange[1])] :
			[tr(efRange), tr(efRange)]
	) as [string, string]
}

export function ImageBlock(props: {
	src: string
}) {
	return (
		<p style={{lineHeight: 1}}>
			<img src={props.src} style={{width: '100%', border: '1px solid #0002'}} />
		</p>
	)
}

/**
 * 乐谱样例块
 *
 * @prop children 乐谱文本
 * @prop efRange 乐谱渲染的展示范围
 * @prop hide 默认隐藏代码
 * @prop noCode 不显示代码
 * @prop noPreview 不显示预览
 * @prop noLoad 不显示尝试按钮
 * @prop inverse 将预览显示在代码之后
 * @prop mt 渲染块的上边距
 * @prop mb 渲染块的下边距
 */
export function RealtimeScore(props: {
	children: string
	efRange?: string | number | (string | number)[]
	hide?: boolean
	noCode?: boolean
	noPreview?: boolean
	noLoad?: boolean
	noTitle?: boolean
	inverse?: boolean
	mt?: number
	mb?: number
	doPagination?: boolean
}) {
	return <BrowserOnly>{() => (
		<RealtimeScore__
			{...props}
		/>
	)}</BrowserOnly>
}
export function RealtimeScore__(props: {
	children: string
	efRange?: string | number | (string | number)[]
	hide?: boolean
	noCode?: boolean
	noPreview?: boolean
	noLoad?: boolean
	noTitle?: boolean
	inverse?: boolean
	mt?: number
	mb?: number
	doPagination?: boolean
}) {
	const classes = useStyles()

	const [ expanded, setExpanded ] = useState(false)

	const code = props.children
	const formattedCode = Util.formatLoadingCode(code)
	const canLoad = !props.noCode && !props.noLoad
	const canExpand = !props.noCode && (props.hide || Util.codePreserved(code))

	const showCode = !props.noCode && (!props.hide || expanded)
	const showPreview = !props.noPreview
	const hideExpansion = canExpand && !expanded
	const inverse = props.inverse

	const ExpandIcon = expanded ? Icons.FaChevronUp : Icons.FaChevronDown

	const PreviewBox = showPreview && <div className={classes.PreviewBox}>
		<div style={{maxWidth: '1000px', margin: '0 auto'}}>
			<BrowserOnly>{() => (
				<NMNDisplay
					code={formattedCode}
					efRange={transformEfRange(props.efRange)}
					mt={props.mt} mb={props.mb}
					doPagination={props.doPagination}
				/>
			)}</BrowserOnly>
		</div>
	</div>
	const CodeBox = showCode && <div className={
		'score-example' +
		' ' + classes.CodeBox +
		(hideExpansion ? ' score-example-preserved' : '')
	}>
		<CodeBlock showLineNumbers language='spnmn'>
			{code}
		</CodeBlock>
	</div>
	const CodeControls = (canLoad || canExpand) && <div className={classes.CodeControlsBox}>
		{canExpand && <LinkSanitizer><Link
			href='#!'
			onClick={(evt) => {
				setExpanded(!expanded)
			}}
		>
			{expanded ? '收起' : '展开'}
			{' '}
			<ExpandIcon style={{transform: 'translateY(0.15em)'}} />
		</Link></LinkSanitizer>}
		{canLoad && canExpand && '\u3000'}
		{canLoad && <TryButton code={formattedCode} />}
	</div>

	return <div className={classes.container}>
		{/* {!props.noTitle && <div className={classes.title}>乐谱样例</div>} */}
		{!inverse ? <>
			{PreviewBox}
			{!!(PreviewBox && (CodeBox || CodeControls)) && <div className={classes.delimiter}></div>}
			{CodeBox}
			{!!(CodeBox && CodeControls) && <div className={classes.delimiter}></div>}
			{CodeControls}
		</> : <>
			{CodeBox}
			{!!(CodeBox && CodeControls) && <div className={classes.delimiter}></div>}
			{CodeControls}
			{!!((CodeBox || CodeControls) && PreviewBox) && <div className={classes.delimiter}></div>}
			{PreviewBox}
		</>}
	</div>
}

/**
 * 链接消磁器
 */
export function LinkSanitizer(props: {
	children: ReactNode
}) {
	const linkRef = createRef<HTMLParagraphElement>()

	useEffect(() => {
		if (linkRef.current) {
			let children = linkRef.current.children
			for(let i = 0; i < children.length; i++) {
				;(children[i] as HTMLAnchorElement).href = 'javascript:;'
			}
		}
	}, [])

	return <span ref={linkRef}>
		{props.children}
	</span>
}

/**
 * 尝试样例按钮
 */
export function TryButton(props: {
	code: string
}) {
	const playgroundUrl = usePlaygroundUrl()

	return <LinkSanitizer>
		<Link
			href='#!'
			onClick={(evt) => {
				window.sendAnalyticsEvent('Try example')
				const code = props.code
				localStorage.setItem(playgroundStoreKey, code)
				window.open(playgroundUrl)
				evt.preventDefault()
			}}
		>
			在试用模式中尝试
			{' '}
			<Icons.FaExternalLinkAlt style={{transform: 'translateY(0.12em)'}} />
		</Link>
	</LinkSanitizer>
}

/**
 * 无渲染的乐谱样例
 */
export function ScoreExample(props: {
	children: string
	canLoad?: boolean
	hide?: boolean
}) {
	return <RealtimeScore
		children={props.children}
		noLoad={!props.canLoad}
		noPreview
		hide={props.hide}
	/>
}

/**
 * Docusauras 绿（bushi
 * 
 * 其实是配置演示界面的小标题
 */
export function Highlight(props: {
	children: ReactNode
}) {
	return <span style={{
		backgroundColor: 'rgba(0, 0, 0, 0.1)',
		padding: '0.2em 0.4em',
		paddingRight: '2.4em',
		borderRadius: '2px',
		color: '#333',
		clipPath: 'polygon(0 0, calc(100% - 1em) 0, 100% 100%, 0 100%)'
	}}>
		{props.children}
	</span>
}

/**
 * 渲染属性演示
 */
export function RenderPropsDemo(props: {
	children: string
	efRange?: string | number | (string | number)[]
	values: string[]
	mt?: number
	mb?: number
}) {
	// 向代码模板中填入属性参数
	function replacedCode(value: string) {
		const values = value.split(', ')
		let text = props.children
		for(let value of values) {
			text = text.replace('###', value.trim())
		}
		return text
	}

	return <>
		<ScoreExample canLoad children={replacedCode(props.values[0])} />
		{props.values.map(value => {
			const code = replacedCode(value)
			return <React.Fragment key={value}>
				<p><Highlight children={value} /></p>
				<RealtimeScore
					noTitle
					noCode
					children={code}
					efRange={props.efRange}
					mt={props.mt}
					mb={props.mb}
				/>
			</React.Fragment>
		})}
	</>
}

/**
 * 自行尝试按钮
 */
export function TryYourself() {
	const playgroundUrl = usePlaygroundUrl()
	return (
		<p style={{textAlign: 'left'}}><Link href={playgroundUrl} onClick={() => window.sendAnalyticsEvent('Try yourself')}>
			在试用模式中自行尝试
			{' '}
			<Icons.FaExternalLinkAlt style={{transform: 'translateY(0.12em)'}} />
		</Link></p>
	)
}

