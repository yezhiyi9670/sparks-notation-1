import * as playground from './component/playground'
import * as version_info from './component/version-info'
import * as score_example from './component/score-example'
import * as spoiler from './component/spoiler'
import * as challenge from './component/challenge'
import * as guide from './component/guide'
import * as page from './component/page'
import React from 'react'
import LatestVersion from '../versions'

const version = LatestVersion.version
const desktop_version = LatestVersion.desktop_version

const merged = {
	...playground,
	...version_info,
	...score_example,
	...spoiler,
	...challenge,
	...guide,
	...page,
	Version: function() {
		return <>{version}</>
	},
	version,
	DesktopVersion: function() {
		return <>{desktop_version}</>
	},
	desktop_version
}

export default merged
