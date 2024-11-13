import Layout from "@theme/Layout";
import React from "react";

import Mdx from '@site/src/mdx'
import Link from "@docusaurus/Link";

import Tabs1 from '@theme/Tabs';
import TabItem1 from '@theme/TabItem';
import Admonition from '@theme/Admonition'
import * as Icons from 'react-icons/fa'
import { useSiteUrl } from "../mdx/component/playground";
import C from '@site/src/mdx'

const Tabs = Tabs1 as any
const TabItem = TabItem1 as any

const faIconStyles: React.CSSProperties = {
	transform: 'translateY(0.15em)',
	marginRight: '0.5em'
}

const buttonStyles: React.CSSProperties = {
	marginRight: '1em',
	marginBottom: '1em'
}

export default function DownloadPage() {
	const baseUrl = useSiteUrl()
	const urls = {
		ghReleases: 'https://github.com/yezhiyi9670/sparks-notation-1/releases',
		gh: 'https://github.com/yezhiyi9670/sparks-notation-1',
		download: baseUrl + '/.download-bin/sparks-nmn-desktop-win32-x64-' + C.desktop_version + '.zip'
	}

	return (
		<Mdx.ArticlePageWrapper
			title='桌面版下载'
			description='Sparks NMN 桌面版官方下载'
		>
			<h1>桌面版下载</h1>

			<p>桌面版是包含完整 Sparks NMN 核心，可以离线使用的版本。相比于在线试用页面，桌面版还支持文件保存、打印、偏好设置等功能。</p>

			<Admonition type='info' title='关于预构建版本'>
				<p>最新预构建版本：Sparks NMN Desktop <Mdx.DesktopVersion /></p>
				<p>只有某些特定的<strong>稳定版</strong>会被构建成可以直接运行的程序。如果需要其他开发版本，请通过<Link href={urls.gh}>源代码</Link>构建。</p>
			</Admonition>

			<Tabs>
				<TabItem value='windows' label='Windows'>
					<p>预构建版本不需要安装，解压即可使用。</p>
					<p>考虑到 GitHub 可能速度慢的问题，我们提供了直接下载链接。注意，通过此链接只能下载到最新的预构建版本。</p>
					<Link className={`button button--primary`} style={buttonStyles} href={urls.download} onClick={() => window.sendAnalyticsEvent('Download')}>
						<Icons.FaDownload style={faIconStyles} />
						直接下载 <Mdx.DesktopVersion />
					</Link>
					<Link className={`button button--info`} style={buttonStyles} href={urls.ghReleases} onClick={() => window.sendAnalyticsEvent('Download')}>
						<Icons.FaDownload style={faIconStyles} />
						GitHub Releases
					</Link>
					<Link className={`button button--secondary`} style={buttonStyles} href={urls.gh} onClick={() => window.sendAnalyticsEvent('Download sources')}>
						<Icons.FaTerminal style={faIconStyles} />
						从源代码构建
					</Link>
				</TabItem>
				<TabItem value='linux' label='Linux'>
					<p>目前还没有适用于 Linux 的预构建版本，但我们很快会尝试添加。</p>
					<Link className={`button button--secondary`} style={buttonStyles} href={urls.gh} onClick={() => window.sendAnalyticsEvent('Download sources')}>
						<Icons.FaTerminal style={faIconStyles} />
						从源代码构建
					</Link>
				</TabItem>
				<TabItem value='macos' label='Mac OS'>
					<p>我们没用过也没有 Mac，无法直接在 Mac OS 上构建程序，因此短期内不会提供 Mac OS 预构建版本。</p>
					<Link className={`button button--secondary`} style={buttonStyles} href={urls.gh} onClick={() => window.sendAnalyticsEvent('Download sources MacOS')}>
						<Icons.FaTerminal style={faIconStyles} />
						尝试从源代码构建
					</Link>
				</TabItem>
			</Tabs>

			<p style={{marginTop: '3em'}}><img style={{
				width: '100%',
				border: '1px solid #0002'
			}} src={require('./assets/desktop-screenshot.png').default} /></p>
		</Mdx.ArticlePageWrapper>
	)
}
