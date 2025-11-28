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
		winDownload: baseUrl + '/.download-bin/windows/sparks-nmn-desktop-win32-x64-' + C.desktop_version + '.zip',
		gnuLinuxDownload: baseUrl + '/.download-bin/gnu-linux/sparks-nmn-desktop-linux-x64-' + C.desktop_version + '.zip',
		appImageDownload: baseUrl + '/.download-bin/gnu-linux/sparks-nmn-desktop-' + C.desktop_version + '.AppImage'
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
					<p>Windows 版本有以下运行方式：</p>
					<ul>
						<li><b>Zip</b>。解压运行 <code>sparks-nmn-desktop.exe</code> 即可使用。数据存储在同一文件夹下的 <code>data</code> 文件夹中。</li>
					</ul>
					<p>注意，若要分享下载链接，请分享此页链接而非下载按钮指向的直链，因为网站上只会保留最近两个版本，之前版本的直链会失效。</p>
					<Link className={`button button--primary`} style={buttonStyles} href={urls.winDownload} onClick={() => window.sendAnalyticsEvent('Download')}>
						<Icons.FaDownload style={faIconStyles} />
						直链 Zip <Mdx.DesktopVersion />
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
				<TabItem value='gnu-linux' label='GNU/Linux'>
					<p>GNU/Linux 版本有以下运行方式：</p>
					<ul>
						<li><b>Zip</b>。解压运行 <code>sparks-nmn-desktop</code> 即可使用。数据存储在 <code>~/.config/sparks-nmn-desktop</code> 文件夹中。</li>
						<li><b>AppImage</b>。直接双击即可运行。数据存储在 <code>~/.config/sparks-nmn-desktop</code> 文件夹中。</li>
					</ul>
					<p>注意，若要分享下载链接，请分享此页链接而非下载按钮指向的直链，因为网站上只会保留最近两个版本，之前版本的直链会失效。</p>
					<Link className={`button button--primary`} style={buttonStyles} href={urls.gnuLinuxDownload} onClick={() => window.sendAnalyticsEvent('Download')}>
						<Icons.FaDownload style={faIconStyles} />
						直链 Zip <Mdx.DesktopVersion />
					</Link>
					<Link className={`button button--primary`} style={buttonStyles} href={urls.appImageDownload} onClick={() => window.sendAnalyticsEvent('Download')}>
						<Icons.FaDownload style={faIconStyles} />
						直链 AppImage <Mdx.DesktopVersion />
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
				<TabItem value='macos' label='Mac OS'>
					<p>由于 Apple 的限制，构建 Mac OS 程序需要有支持 Mac OS 的实体设备。我们短期内不会提供 Mac OS 预构建版本。</p>
					<p>但是，桌面版应用通过 Electron 实现，理论上支持 Mac OS，因此你可以尝试自己编译源代码并修复适配问题。</p>
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
