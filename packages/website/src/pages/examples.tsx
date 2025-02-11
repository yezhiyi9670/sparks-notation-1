import Layout from "@theme/Layout";
import React from "react";

import Mdx from '@site/src/mdx'
import Link from "@docusaurus/Link";

import Tabs1 from '@theme/Tabs';
import TabItem1 from '@theme/TabItem';
import Admonition from '@theme/Admonition'
import * as Icons from 'react-icons/fa'
import { PreloadPlaygroundFonts, usePlaygroundUrl, useSiteUrl } from "../mdx/component/playground";
import { createUseStyles } from "react-jss";

const faIconStyles: React.CSSProperties = {
	transform: 'translateY(0.15em)',
	marginRight: '0.5em'
}

function ExampleScoresTable(props: {
	children: React.ReactNode
}) {
	return (
		<table>
			<tbody>
				<tr>
					<th style={{whiteSpace: 'nowrap'}}>编号</th>
					<th style={{whiteSpace: 'nowrap'}}>类型</th>
					<th style={{whiteSpace: 'nowrap', minWidth: '8em'}}>曲名</th>
					<th style={{whiteSpace: 'nowrap', minWidth: '12em'}}>主要特性</th>
					<th style={{whiteSpace: 'nowrap'}}>操作</th>
				</tr>
				{props.children}
			</tbody>
		</table>
	)
}

function ExampleScoreRow(props: {
	number: number,
	id: string,
	type: string,
	title: string,
	features: string,
	url?: string,
}) {
	const playgroundUrl = usePlaygroundUrl()

	return (
		<tr>
			<td style={{whiteSpace: 'nowrap', textAlign: 'right'}}>{props.number}</td>
			<td style={{whiteSpace: 'nowrap'}}>{props.type}</td>
			<td style={{}}>{props.title}</td>
			<td style={{}}>{props.features}</td>
			<td style={{whiteSpace: 'nowrap', textAlign: 'right'}}>
				{props.url && <>
					<Link className={`button button--info`} style={{marginRight: '0.75em'}} href={props.url} onClick={() => window.sendAnalyticsEvent('Example link')}>
						<Icons.FaExternalLinkAlt style={faIconStyles} />
						链接
					</Link>
				</>}
				<Link className={`button button--primary`} href={playgroundUrl + '?load-example=' + encodeURIComponent(props.id + '.spnmn')} onClick={() => window.sendAnalyticsEvent('Example launch')}>
					<Icons.FaArrowRight style={faIconStyles} />
					启动
				</Link>
			</td>
		</tr>
	)
}

export default function ExamplesPage() {
	return (
		<Mdx.ArticlePageWrapper
			title='示例乐谱'
			description='Sparks NMN 的一些示例乐谱，供学习使用。'
		>
			<PreloadPlaygroundFonts />
			<h1>示例乐谱</h1>

			<p>这里是我们提供的一些乐谱文件。如果你喜欢通过例子自己探索功能和语法，而不是按部就班地阅读教程，那么你可以参考这些东西。</p>
			
			<Admonition type='caution' title='注意'>
				这里的乐谱仅用于参考和学习。因为除了前两个以外，别的都是听写出来的，所以内容不一定完全正确，请谨慎对待。将这些示例谱用于音乐排演是严格不推荐的行为。
			</Admonition>

			<ExampleScoresTable>
				<ExampleScoreRow
					number={0}
					id='小星星'
					type='简单儿歌'
					title='小星星'
					features='极简谱面、多章节、中文歌词、英文歌词'
				/>
				<ExampleScoreRow
					number={1}
					id='数鸭子'
					type='简单儿歌'
					title='数鸭子'
					features='节奏、中文歌词、多行歌词'
				/>
				<ExampleScoreRow
					number={2}
					id='Do Re Mi'
					type='简单儿歌'
					title='Do Re Mi'
					features='节奏、英文歌词、反复与区分'
				/>
				<ExampleScoreRow
					number={3}
					id='卖报歌'
					type='简单儿歌'
					title='卖报歌'
					features='多行歌词'
					url='https://music.163.com/#/song?id=566436179'
				/>
				<ExampleScoreRow
					number={4}
					id='Childhood'
					type='多声部乐曲'
					title='Childhood'
					features='变化音、多声部、转调、鼓点行、反复与区分'
					url='https://music-archive.sparkslab.art/7001'
				/>
				<ExampleScoreRow
					number={5}
					id='DL-万圣节魔方'
					type='《跳舞的线》'
					title='万圣节魔方'
					features='变化音'
					url='https://music.163.com/#/program?id=2057497635'
				/>
				<ExampleScoreRow
					number={6}
					id='落日与晚风'
					type='流行歌曲'
					title='落日与晚风'
					features='多歌手、复杂节奏、布局调整'
					url='https://kuwo.cn/play_detail/183981434'
				/>
				<ExampleScoreRow
					number={7}
					id='小手拉大手'
					type='流行歌曲'
					title='小手拉大手'
					features='反复与区分、拆分连音线'
					url='https://www.kuwo.cn/play_detail/213974'
				/>
				<ExampleScoreRow
					number={8}
					id='爱很美'
					type='流行歌曲'
					title='爱很美'
					features='多歌手、反复与区分、拆分连音线、中英混合歌词'
					url='https://www.kuwo.cn/play_detail/6446676'
				/>
				<ExampleScoreRow
					number={9}
					id='鲁冰花'
					type='流行儿歌'
					title='鲁冰花'
					features='转调、反复与区分、非常规调式'
					url='https://www.kuwo.cn/play_detail/582027'
				/>
				<ExampleScoreRow
					number={10}
					id='爱殇'
					type='流行歌曲'
					title='爱殇'
					features='多声部、反复与区分'
					url='https://kuwo.cn/play_detail/183108704'
				/>
				<ExampleScoreRow
					number={11}
					id='勇气大爆发'
					type='流行儿歌（合唱）'
					title='勇气大爆发'
					features='多声部、反复与区分、三连音、标记符号'
					url='https://kuwo.cn/play_detail/182142252'
				/>
				<ExampleScoreRow
					number={12}
					id='枕边童话'
					type='流行歌曲'
					title='枕边童话'
					features='六拍子、变化音、反复与区分'
					url='https://kuwo.cn/play_detail/153791751'
				/>
				<ExampleScoreRow
					number={13}
					id='秘境茶会'
					type='流行歌曲'
					title='秘境茶会'
					features='六拍子、多声部、复杂曲式结构、变化音、转调、变拍、变速'
					url='https://y.qq.com/n/ryqq/songDetail/003d9zJy03q4Gh'
				/>
				<ExampleScoreRow
					number={14}
					id='小女孩的诅咒'
					type='流行歌曲'
					title='小女孩的诅咒'
					features='多声部、基调不一致、变化音'
					url='https://y.qq.com/n/ryqq/songDetail/002KUunI48k12y'
				/>
				<ExampleScoreRow
					number={15}
					id='安娜的橱窗'
					type='流行歌曲'
					title='安娜的橱窗'
					features='摇摆节奏、变化音'
					url='https://kuwo.cn/play_detail/274119909'
				/>
				<ExampleScoreRow
					number={16}
					id='For the First Time in Forever'
					type='冰雪奇缘歌曲'
					title='For the First Time in Forever'
					features='布局调整、多声部、转调、变拍、变速、标记型歌词'
				/>
				<ExampleScoreRow
					number={17}
					id='Let It Go'
					type='冰雪奇缘歌曲'
					title='Let It Go'
					features='布局调整、多声部、转调、变拍、力度标记、歌词翻译'
				/>
				<ExampleScoreRow
					number={18}
					id='TheMusicTheory'
					type='多声部乐曲'
					title='The Music Theory I'
					features='多声部、鼓点行、紧凑声部、反常拍号、转调、变拍、摇摆节奏、三连音、和弦标记'
				/>
			</ExampleScoresTable>
			
			<p>这些示例谱还未覆盖 Sparks NMN 的所有特性，并且目前并不能代替教程。</p>

		</Mdx.ArticlePageWrapper>
	)
}
