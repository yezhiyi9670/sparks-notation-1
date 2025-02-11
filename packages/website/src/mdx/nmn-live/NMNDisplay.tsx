import { NMNI18n, SparksNMN } from "@sparks-notation/core"
import React, { createRef, useEffect, useState } from "react"
import { useMemo } from "react"
import { usePlaygroundUrl } from "../component/playground"
import { SparksNMNDisplay } from "@sparks-notation/react-editor/base/SparksNMNDisplay"
import { md5 } from "@sparks-notation/util/md5"
import { FontLoaderProxy } from "@sparks-notation/core/renderer/FontLoaderProxy"
import { Util } from "../util/util"
import $ from 'jquery'
import { EquifieldSection } from "@sparks-notation/core/equifield/equifield"

const heightCacheMap: {[_: string]: number} = {}

const countInfo = {
	alive: 0,
	rendered: 0
}

/**
 * Sparks NMN 实时渲染预览版本
 * 
 * 自动检测字体加载等问题
 */
export function NMNDisplay(props: {
	code: string
	efRange?: [string, string]
	narrow?: boolean
	mt?: number
	mb?: number
	style?: React.CSSProperties
	doPagination?: boolean
}) {
	const playgroundUrl = usePlaygroundUrl()
	const fontStaticPath = playgroundUrl + 'core-resources/font'
	const ref = createRef<HTMLDivElement>()
	
	const result = useMemo(() => {
		return SparksNMN.parse(props.code)
	}, [props.code])
	const hash = useMemo(() => {
		return md5(props.code + JSON.stringify(props.efRange))
	}, [props.code, props.efRange])
	
	const [ init, setInit ] = useState(FontLoaderProxy.getState() == 'loaded')
	const [ rendered, setRendered ] = useState(false)
	const [ progressData, setProgressData ] = useState([0, 1])
	const getRendered = Util.useMethod(() => rendered)

	// ===== 高度统计 =====
	const minHeight = heightCacheMap[hash] ?? 0
	const updateHeight = () => {
		if(rendered) {
			if(ref.current) {
				heightCacheMap[hash] = ref.current.clientHeight
			}
		}
	}
	useEffect(() => {
		FontLoaderProxy.requestFontLoad(fontStaticPath, () => {
			setInit(true)
		}, (progress: number, total: number) => {
			setProgressData([progress, total])
		})
		countInfo.alive += 1
		addEventListener('resize', updateHeight)
		return () => {
			countInfo.alive -= 1
			if(getRendered()) {
				countInfo.rendered -= 1
			}
			removeEventListener('resize', updateHeight)
		}
	}, [])
	useEffect(() => { updateHeight() })

	const transformFields = Util.useMethod((fields: EquifieldSection[]) => fields.filter((item: EquifieldSection) => item.label != 'topPrintMargin'))

	// ===== 渲染 =====
	return <div style={{
		lineHeight: '1.15',
		userSelect: 'text',
		minHeight: (rendered ? 0 : minHeight) + 'px',
		marginTop: `${0.2 + (init ? (props.mt ?? 0) : 0)}em`,
		marginBottom: `${0.2 + (init ? (props.mb ?? 0) : 0)}em`,
		...props.style
	}}>
		<div ref={ref}>
			{init && <div style={{
				margin: props.narrow ? '0 -2%' : '0 -1%',
				...(!rendered && {
					visibility: 'hidden',
					height: 0
				})
			}}>
				<SparksNMNDisplay
					result={result}
					efRange={props.efRange}
					language={NMNI18n.languages.zh_cn}
					transformFields={transformFields}
					doPagination={props.doPagination}
					onReportError={() => setTimeout(() => {
						if(!rendered) {
							// 链接锚点修正
							countInfo.rendered += 1
							if(countInfo.rendered == countInfo.alive) {
								const $docbox = $(
									'article>div.markdown'
								)
								if($docbox.length > 0 && !$docbox.hasClass('SparksNMN-display-loaded')) {
									$docbox.addClass('SparksNMN-display-loaded')
									if(location.hash) {
										location.href = location.hash
									}
								}
							}

							setRendered(true)
						}
					}, 0)}
				/>
			</div>}
			{(!init || !rendered) && <div style={{padding: '4px 8px'}}>
				<div style={{marginBottom: '1em'}}>
					{!init ? '资源加载完毕后，预览将会显示。' : '即将完成渲染...'}
				</div>
				<div style={{display: 'flex'}}>
					<div style={{flex: 'auto', background: '#0002', position: 'relative'}}>
						<div style={{background: '#000', height: '100%', width: `${progressData[0] / progressData[1] * 100}%`}} />
					</div>
					<span style={{minWidth: '3.5em', flex: 0, marginLeft: '0.5em'}}>
						{progressData[0]}/{progressData[1]}
					</span>
				</div>
			</div>}
		</div>
	</div>
}
