import { NMNI18n } from '@sparks-notation/core'
import { commandDefs } from '@sparks-notation/core/parser/commands'
import React from 'react'

export function CommandReference(props: {
	level: number
	special?: boolean
}) {
	return <>
		<table>
			<tbody>
				<tr>
					<th>命令头</th>
					<th>全称</th>
					<th>说明</th>
					<th>必须</th>
					<th>唯一</th>
					<th>内容</th>
					<th>属性</th>
				</tr>
				{commandDefs.filter((def) => def.levels.includes(props.level) && (def.special == 'none' || !!def.special == !!props.special)).map((def) => {
					return <tr key={def.head}>
						<td><code>{def.head}</code></td>
						<td><code>{def.headFull}</code></td>
						<td>{description[def.head] ?? '-'}</td>
						<td>{def.required ?? '-'}</td>
						<td>{def.unique ?? '-'}</td>
						<td>{{none: '-', text: '文本', separated: '空格分割', tokenized: '符号化'}[def.contentType]}</td>
						<td>{{none: '-', optional: '可选', required: '必须'}[def.hasProps]}</td>
					</tr>
				})}
			</tbody>
		</table>
	</>
}

const description = NMNI18n.languages.zh_cn.commands
