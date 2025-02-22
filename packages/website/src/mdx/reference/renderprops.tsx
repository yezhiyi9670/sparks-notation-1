import { NMNI18n } from '@sparks-notation/core'
import { renderPropsDefault } from '@sparks-notation/core/renderer/props'
import React from 'react'
import { MinVersion } from '../component/version-info'

type PropsFamily = 'n' | 'page' | 'misc' | 'offset' | 'font' | 'margin'

function determineFamily(name: string): PropsFamily {
	if(name == 'page' || name == 'double_sided') {
		return 'page'
	}
	if(name == 'n' || name == 'time_lining' || name == 'legacy_positioning') {
		return 'n'
	}
	if(name.startsWith('offset_')) {
		return 'offset'
	}
	if(name.startsWith('margin_') || name.startsWith('inset_')) {
		return 'margin'
	}
	if(name.startsWith('font_')) {
		return 'font'
	}
	return 'misc'
}

export function RenderPropType(props: {
	name: string
}) {
	return <p>
		名称：<code>{props.name}</code>，
		类型：<code>{(renderPropsLabel[props.name] ?? ['', ''])[0]}</code>，
		默认值：<code>{(renderPropsDefault as {[_: string]: any})[props.name].toString()}</code>
	</p>
}

export function RenderPropsReference(props: {
	filters?: string[]
}) {
	const lst: React.ReactNode[] = []
	for(let key in renderPropsDefault) {
		if(!props.filters || props.filters.includes(key) || props.filters.includes(determineFamily(key))) {
			lst.push(<tr key={key}>
				<td>
					<code>{key}</code>
					{renderPropsLabel[key] && renderPropsLabel[key][2] && <>
						<br />
						<MinVersion min={renderPropsLabel[key][2]} inline />
					</>}
				</td>
				<td><code>{(renderPropsLabel[key] ?? ['', ''])[0]}</code></td>
				<td>{NMNI18n.renderPropsDesc(NMNI18n.languages.zh_cn, key)}</td>
				<td><code>{(renderPropsDefault as {[_: string]: any})[key].toString()}</code></td>
			</tr>)
		}
	}

	return <>
		<table>
			<tbody>
				<tr>
					<th>名称</th>
					<th>类型</th>
					<th>说明</th>
					<th>默认值</th>
				</tr>
				{lst}
			</tbody>
		</table>
	</>
}

const renderPropsLabel = {
	'page': ['page', '页面大小，设置后启用页面精排'],
	'double_sided': ['boolean', '分页时假设双面打印'],
	'n': ['number', '每行小节数'],
	'time_lining': ['boolean', '基于时值的小节宽度'],
	'legacy_positioning': ['boolean', '使用旧版布局算法'],
	'debug': ['boolean', '预览中显示校验信息'],
	'sectionorder': ['"paren"|"bracket"|"plain"|"none"', '小节线序号模式'],
	'scale': ['number', '文档缩放'],
	'gutter_left': ['number', '曲谱的额外左边距'],
	'connector_left': ['number', '连谱号的额外左边距'],
	'left_separator': ['number', '显示行首的小节线'],
	'grayout': ['boolean', '降低延长连音音符的不透明度'],
	'explicitmarkers': ['boolean', '总是显示声部标签'],
	'font_sectionorder': ['font', '字体 - 小节序号', '1.15.1'],
	'font_part': ['font', '字体 - 声部标签'],
	'font_article': ['font', '字体 - 章节标题'],
	'font_title': ['font', '字体 - 大标题'],
	'font_subtitle': ['font', '字体 - 副标题'],
	'font_author': ['font', '字体 - 作者'],
	'font_corner': ['font', '字体 - 角落标记'],
	'font_text': ['font', '字体 - 文本章节'],
	'font_footnote': ['font', '字体 - 尾注'],
	'font_descend': ['font', '字体 - 页脚'],
	'font_attr': ['font', '字体 - 属性文本'],
	'font_force': ['font', '字体 - 力度'],
	'font_chord': ['font', '字体 - 和弦'],
	'font_annotation0': ['font', '字体 - 默认自定义标记'],
	'font_annotation1': ['font', '字体 - 第一自定义标记'],
	'font_annotation2': ['font', '字体 - 第二自定义标记'],
	'font_annotation3': ['font', '字体 - 第三自定义标记'],
	'font_annotation4': ['font', '字体 - 第四自定义标记'],
	'font_annotation5': ['font', '字体 - 第五自定义标记'],
	'font_annotation6': ['font', '字体 - 第六自定义标记'],
	'font_lyrics': ['font', '字体 - 歌词'],
	'font_checkpoint': ['font', '字体 - 段落标记'],
	'margin_after_props': ['number', '(2)间距 - 大标题之后'],
	'margin_after_article': ['number', '(1.5)间距 - 章节之后'],
	'margin_after_header': ['number', '(0)间距 - 章节标题之后'],
	'margin_after_header_text': ['number', '(1.5)间距/额外 - 文本章节标题之后'],
	'margin_before_line': ['number', '(0.8)间距 - 乐谱行之前'],
	'margin_after_line': ['number', '(0.1)间距 - 乐谱行之后'],
	'margin_between_parts': ['number', '(2.5)间距 - 声部之间'],
	'margin_after_part_notes': ['number', '(2)间距 - 声部曲谱部分之后'],
	'inset_before_lyrics': ['number', '(1.3)负间距 - 声部歌词组之前'],
	'margin_after_lyrics': ['number', '(0.1)间距 - 声部歌词组之后'],
	'margin_after_part': ['number', '(1)间距 - 声部之后'],
	'offset_lyrics_iter': ['number', '(1.5)偏移值 - 歌词行编号'],
	'offset_section_boundary': ['number', '(1)偏移值 - 小节边距'],
} as {[_: string]: [string, string, string?]}
