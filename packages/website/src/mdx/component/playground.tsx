import BrowserOnly from "@docusaurus/BrowserOnly"
import useDocusaurusContext from "@docusaurus/useDocusaurusContext"
import useIsBrowser from "@docusaurus/useIsBrowser"
import { FontLoaderProxy } from "@sparks-notation/core/renderer/FontLoaderProxy"
import React, { useEffect } from "react"

export const useSiteUrl = () => {
	const context = useDocusaurusContext()
	if(useIsBrowser()) {
		return location.origin
	} else {
		return context.siteConfig.url
	}
}

export const usePlaygroundUrl = () => {
	return useSiteUrl() + '/playground/'
}

export const playgroundStoreKey = 'sparks-nmn-demo-src'

/**
 * 预加载试用模式字体（不阻塞加载进程），避免用户需要使用时加载时间过长
 */
export function PreloadPlaygroundFonts() {
	return <BrowserOnly>{() => (
		<PreloadPlaygroundFontsInner />
	)}</BrowserOnly>
}
function PreloadPlaygroundFontsInner() {
	const playgroundUrl = usePlaygroundUrl()
	const fontStaticPath = playgroundUrl + 'core-resources/font/'

	useEffect(() => {
		setTimeout(() => {
			FontLoaderProxy.requestFontLoad(fontStaticPath, () => {
				console.log('Playground fonts loaded successfully')
			})
		}, 500)
	}, [])

	return <></>
}
