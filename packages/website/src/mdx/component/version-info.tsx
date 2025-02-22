import React, { ReactNode } from 'react'

export function MinVersion(props: {
	min?: string
	max?: string
	inline?: boolean
	bland?: boolean
	children?: ReactNode
}) {
	const type = (() => {
		if(props.min !== undefined && props.max !== undefined) {
			return 'range'
		}
		if(props.min !== undefined) {
			return 'min'
		}
		if(props.max !== undefined) {
			return 'max'
		}
		return 'any'
	})()

	const tags = <>
		{type == 'any' && <span style={{
			borderRadius: '0.25rem',
			padding: '0.25em 0.5em',
			fontSize: '0.9em',
			...(props.bland ? {
				border: '1px solid #0002'
			} : {
				color: '#37474F',
				background: '#ECEFF1',
			})
		}}>所有版本</span>}
		{(type == 'min' || type == 'range') && <span style={{
			borderRadius: '0.25rem',
			padding: '0.25em 0.5em',
			fontSize: '0.9em',
			...(type == 'range' && {
				marginRight: '0.5rem'
			}),
			...(props.bland ? {
				border: '1px solid #0002'
			} : {
				color: '#366334',
				background: '#D4EED3',
			})
		}}>新增于 {props.min}</span>}
		{(type == 'max' || type == 'range') && <span style={{
			borderRadius: '0.25rem',
			padding: '0.25em 0.5em',
			fontSize: '0.9em',
			...(props.bland ? {
				border: '1px solid #0002'
			} : {
				color: '#880E4F',
				background: '#FCE4EC',
			})
		}}>移除于 {props.max}</span>}
	</>

	const tagElement = props.inline ? <sup style={{margin: '0 0'}}>
		{' '}{tags}{' '}
	</sup> : <p style={{marginTop: '-0.5em'}}>
		{tags}
	</p>

	return <>
		{props.children && <span style={{
			// background: type == 'min' ? '#4527A01C' : '#880E4F1C',
			background: '#BFB9CE3C',
			padding: '0.1rem',
			borderRadius: '0.25rem'
		}}>{props.children}</span>}
		{tagElement}
	</>
}
