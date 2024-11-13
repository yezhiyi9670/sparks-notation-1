import BrowserOnly from "@docusaurus/BrowserOnly";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import useGlobalData, { usePluginData } from "@docusaurus/useGlobalData";
import React from "react";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
	fullContainer: {
		position: 'absolute',
		left: 0,
		top: 0,
		right: 0,
		bottom: 0,
		overflow: 'hidden',
		backgroundColor: '#FFF'
	},
	guideContainer: {
		display: 'flex',
		flexDirection: 'column',
		height: '100%',
		overflow: 'auto',
	},
	spacer: {
		flex: 'auto'
	},
	guideContainerIn: {},
	guideBackdrop: {
		marginLeft: '50%',
		marginRight: '-50%',
		transform: 'translateX(-50%)',
		position: 'relative',
	}
})

export function FullContainer(props: {
	children: React.ReactNode
}) {
	const classes = useStyles()

	return <div className={classes.fullContainer}>
		{props.children}
	</div>
}

export function GuideScreen(props: {}) {
	const classes = useStyles()
	
	return <div className={classes.guideContainer}>
		<div className={classes.spacer}></div>
		<span className={classes.guideContainerIn}>
			<BrowserOnly>{() => (
				<GuideContent />
			)}</BrowserOnly>
		</span>
		<div className={classes.spacer}></div>
	</div>
}

function GuideContent(props: {}) {
	const classes = useStyles()
	const articles = usePluginData('docusaurus-plugin-content-docs')
	console.log(articles)
	
	return (
		<div className={classes.guideBackdrop}></div>
	)
}
