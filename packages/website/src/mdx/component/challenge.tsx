import Admonition from '@theme/Admonition'
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import * as Icons from 'react-icons/fa'
import Link from '@docusaurus/Link';
import React, { useState } from 'react';
import { SpoilerAlert } from './spoiler';
import { createUseStyles } from 'react-jss';
import BrowserOnly from '@docusaurus/BrowserOnly';

const useStyles = createUseStyles({
	desktopOnly: {},
	'@media(max-width: 996px)': {
		desktopOnly: {
			display: 'none'
		}
	}
})

/**
 * 提示
 */
export function Hint(props: {
	children?: React.ReactNode
}) {
	return <SpoilerAlert variant='tip' title='提示' desc=''>
		{props.children}
	</SpoilerAlert>
}
/**
 * 参考答案
 */
export function Solution(props: {
	children?: React.ReactNode
}) {
	return <SpoilerAlert variant='info' title='参考答案' desc=''>
		{props.children}
	</SpoilerAlert>
}
/**
 * 提示与参考答案二合一提示框
 */
export function HintSolution(props: {
	children?: React.ReactElement[] | React.ReactElement
}) {
	let hintOne: React.ReactNode = undefined
	let solutionOne: React.ReactNode = undefined
	const [ displayState, setDisplayState ] = useState<'none' | 'hint' | 'solution'>('none')

	const childrenList = props.children ? ('filter' in props.children ? props.children : [props.children]) : []

	childrenList.map((element) => {
		if(element.type === Hint) {
			hintOne = element.props.children
		} else if(element.type === Solution) {
			solutionOne = element.props.children
		}
	})

	return (
		<>
			<p></p>
			<p>
				{hintOne &&
					<Link
						className={`button button--${displayState == 'hint' ? 'info' : 'secondary'}`}
						onClick={() => setDisplayState(displayState == 'hint' ? 'none' : 'hint')}
						style={{marginRight: '1em'}}
					>
						{displayState == 'hint' ? <>
							<Icons.FaChevronUp style={{transform: 'translateY(0.15em)', marginRight: '0.5em'}}/>
						</> : <>
							<Icons.FaChevronDown style={{transform: 'translateY(0.15em)', marginRight: '0.5em'}}/>
						</>}
						提示
					</Link>
				}
				{solutionOne &&
					<Link
						className={`button button--${displayState == 'solution' ? 'info' : 'secondary'}`}
						onClick={() => setDisplayState(displayState == 'solution' ? 'none' : 'solution')}
					>
						{displayState == 'solution' ? <>
							<Icons.FaChevronUp style={{transform: 'translateY(0.15em)', marginRight: '0.5em'}}/>
						</> : <>
							<Icons.FaChevronDown style={{transform: 'translateY(0.15em)', marginRight: '0.5em'}}/>
						</>}
						参考答案
					</Link>
				}
			</p>
			{displayState == 'hint' && hintOne}
			{displayState == 'solution' && solutionOne}
		</>
	)
}

type ChallengeProps = {
	title?: string
	children?: React.ReactNode
	default?: boolean
}
/**
 * 挑战题
 */
export function Challenge(props: ChallengeProps) {
	return props.children
}
let challengeSerial = 0
/**
 * 挑战题标签页
 */
export function Challenges(props: {
	children: React.ReactElement[] | React.ReactElement
}) {
	return <BrowserOnly>{() => (
		<Challenges__ children={props.children} />
	)}</BrowserOnly>
}
/**
 * 挑战题标签页
 */
export function Challenges__(props: {
	children: React.ReactElement[] | React.ReactElement
}) {
	const styles = useStyles()

	const childrenList = ('filter' in props.children ? props.children : [props.children])

	const items = childrenList.filter((ele) => {
		return ele.type === Challenge
	}).map((ele) => {
		return ele.props as ChallengeProps
	})

	// why can't this f*cking thing be typed?
	const TabItem1 = TabItem as any
	const Tabs1 = Tabs as any

	let initId = 0
	items.forEach((item, index) => {
		if(item.default) {
			initId = index
		}
	})

	const [ controlledValue, setValue ] = useState(initId)
	const [ token, setToken ] = useState(Math.random())
	const [ myId ] = useState(() => {return challengeSerial++})

	function handleTurn(value: number) {
		setValue(value)
		setToken(Math.random()) // why can't this f*cking thing be controlled?
		location.href = '#challenges-group-' + myId
	}
	function handleNav() {
		location.href = '#challenges-group-' + myId
	}

	function handleSelect(index: number) {
		handleTurn(index)
	}

	return <div id={'challenges-group-' + myId} className='challenges-group' style={{marginTop: '-60px', paddingTop: '60px'}}>
		<Admonition type='note' title='试试看'>
			<Tabs1 className='challenge-tabs' key={token} defaultValue={controlledValue}>
				{items.map((item, index) => {
					return <TabItem1 key={item.title} value={index} label={item.title} attributes={{onClick: () => handleSelect(index)}}>
						{index == controlledValue && <>
							{item.children}
							<div style={{display: 'flex', overflow: 'hidden', paddingTop: '0.5rem'}}>
								<Link
									className={`button button--info ${styles.desktopOnly}`}
									onClick={() => handleNav()}
								>
									挑战 {index + 1}/{items.length}
								</Link>
								<div style={{flex: 'auto'}}></div>
								{index != 0 && <Link
									className={`button button--info`}
									onClick={() => handleTurn(index - 1)}
								>
									<Icons.FaChevronLeft style={{transform: 'translateY(0.15em)', marginRight: '0.5em'}}/>
									上一个
								</Link>}
								{index != items.length - 1 && <div style={{width: '0.75em'}}></div>}
								{index != items.length - 1 && <Link
									className={`button button--info`}
									onClick={() => handleTurn(index + 1)}
								>
									下一个
									<Icons.FaChevronRight style={{transform: 'translateY(0.15em)', marginLeft: '0.5em'}}/>
								</Link>}
							</div>
						</>}
					</TabItem1>
				})}
			</Tabs1>
		</Admonition>
	</div>
}
