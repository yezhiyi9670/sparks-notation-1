import Link from "@docusaurus/Link"
import React, { useState } from "react"
import Admonition from '@theme/Admonition'
import * as Icons from 'react-icons/fa'

/**
 * 简单的可展开文本段
 */
export function Spoiler(props: {
	children?: React.ReactNode
	variant?: 'note' | 'tip' | 'info' | 'caution' | 'danger'
	expandText?: string
	collapseText?: string
}) {
	const [open, setOpen] = useState(false)
	
	let buttonType = 'secondary'
	if(props.variant !== undefined) {
		buttonType = {
			'note': 'secondary',
			'tip': 'success',
			'info': 'info',
			'caution': 'warning',
			'danger': 'danger'
		}[props.variant]
	}

	return <>
		<p>
			<Link
				className={`button button--${buttonType}`}
				style={{}}
				onClick={() => setOpen(!open)}
			>
				{open ? <>
					<Icons.FaChevronUp style={{transform: 'translateY(0.15em)', marginRight: '0.5em'}}/>{props.collapseText ?? '收起'}
				</> : <>
					<Icons.FaChevronDown style={{transform: 'translateY(0.15em)', marginRight: '0.5em'}}/>{props.expandText ?? '展开'}
				</>}
				
			</Link>
		</p>
		{open && props.children}
	</>
}

/**
 * 可展开提示框
 */
export function SpoilerAlert(props: {
	children?: React.ReactNode
	title?: string
	desc?: string
	variant: 'note' | 'tip' | 'info' | 'caution' | 'danger'
}) {
	return (
		<Admonition type={props.variant} title={props.title}>
			{props.desc !== undefined && <p>{props.desc}</p>}
			<Spoiler variant={props.variant}>
				{props.children}
			</Spoiler>
		</Admonition>
	)
}
