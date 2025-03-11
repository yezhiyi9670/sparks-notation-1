import Link from '@docusaurus/Link'
import React, { ReactNode } from 'react'
import * as Icons from 'react-icons/fa'
import { FaExternalLinkAlt } from 'react-icons/fa'
import { createUseStyles } from 'react-jss'
import { usePlaygroundUrl } from "../../mdx/component/playground"

const useStyles = createUseStyles({
  externalLink: {
    paddingLeft: '0.2em',
    paddingRight: '0.1em'
  },
  externalLinkIcon: {
    fontSize: '0.8em',
    transform: 'translateY(0.04em)'
  }
})

export function ChangelogTag(props: {
  children: ReactNode,
  background: string,
  foreground: string
}) {
  return (
    <span style={{
      borderRadius: '0.25rem',
      padding: '0.2em 0.4em',
      fontSize: '0.9em',
      color: props.foreground,
      background: props.background,
    }}>{props.children}</span>
  )
}

export function New() {
  return <ChangelogTag foreground='#366334' background='#D4EED3'>新增</ChangelogTag>
}
export function Fix() {
  return <ChangelogTag foreground='#37474F' background='#E3E8ED'>修复</ChangelogTag>
}
export function Mod() {
  return <ChangelogTag foreground='#4527A0' background='#F2E2F9'>改动</ChangelogTag>
}
export function Del() {
  return <ChangelogTag foreground='#880E4F' background='#F5E3E4'>移除</ChangelogTag>
}
export function Dep() {
  return <ChangelogTag foreground='#7E4F12' background='#FFE2D0'>废弃</ChangelogTag>
}
export function Important() {
  return <ChangelogTag foreground='#ffffff' background='#9575cd'>重要</ChangelogTag>
}

export function Source(props: {
  to: string
}) {
  const classes = useStyles()

  return (
    <Link className={classes.externalLink} href={props.to}>
      <FaExternalLinkAlt className={classes.externalLinkIcon} />
    </Link>
  )
}

export function PocLink(props: {
  name: string,
}) {
  const playgroundUrl = usePlaygroundUrl()
  
  return (
    <p><Link href={playgroundUrl + '?load-example=' + encodeURIComponent('version-poc/' + props.name + '.spnmn')}>
      漏洞测试样例
			{' '}
			<Icons.FaBug style={{transform: 'translateY(0.12em)'}} />
      {' '}
      <Icons.FaExternalLinkAlt style={{transform: 'translateY(0.12em)'}} />
    </Link></p>
  )
}
