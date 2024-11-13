import React from 'react'

export function MinVersion(props: {
	min?: string
	max?: string
	inline?: boolean
	bland?: boolean
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
				color: '#4527A0',
				background: '#EDE7F6',
			})
		}}>最低版本：{props.min}</span>}
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
		}}>最高版本：{props.max}</span>}
	</>

	return props.inline ? <span style={{margin: '0 0'}}>
		{' '}{tags}{' '}
	</span> : <p style={{marginTop: '-0.5em'}}>
		{tags}
	</p>
}
