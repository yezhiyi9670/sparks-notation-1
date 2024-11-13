import Layout from "@theme/Layout";
import React, { ReactNode } from "react";

import { createUseStyles } from "react-jss";
import BrowserOnly from "@docusaurus/BrowserOnly";

const useStyles = createUseStyles({
	main: {
		padding: '36px 24px'
	},
	article: {
		maxWidth: '1000px',
		margin: '0 auto'
	}
})

export function ArticlePageWrapper(props: {
	title: string,
	description: string,
	children: ReactNode
}) {
	const classes = useStyles()

	return (
		<BrowserOnly>{() => (
			<Layout
				description={props.description}
				title={props.title}
			>
				<main className={classes.main}>
					<article className={classes.article + ' markdown'}>
						{props.children}
					</article>
				</main>
			</Layout>
		)}</BrowserOnly>
	)
}
