import React, { createRef, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { randomToken } from '@sparks-notation/util/random'
import { useI18n } from '../../i18n/i18n'
import { usePref } from '../../prefs/PrefProvider'
import { SettingsForm, SettingsFormApi } from '../../settings/SettingsForm'
import { Dialog } from '../dialog'
import prefDefs from '../../../common/prefs/entries'

export function SettingsDialog(props: {
	open: boolean
	onClose: () => void
}) {
	const LNG = useI18n()
	const ref = createRef<SettingsFormApi>()
	const [ token, setToken ] = useState(() => randomToken(24))
	const [ loading, setLoading ] = useState(false)
	const [ passAll, setPassAll ] = useState(true)
	const isOpened = useRef(props.open)
	const prefs = usePref()
	
	const isOpening = !isOpened.current && props.open
	isOpened.current = props.open

	// 阻止浏览器重绘，因为这里有重置表单的过程
	useLayoutEffect(() => {
		if(isOpening) {
			setLoading(false)
			setToken(randomToken(24))
		}
	}, [isOpening, props.open])

	function closeWindow() {
		props.onClose()
	}

	async function handleSave() {
		const api = ref.current
		if(!api) {
			return
		}
		setLoading(true) // 万一很卡呢？还是以防万一为好。
		await ref.current.save()
		setLoading(false)
		closeWindow()
	}

	return <Dialog
		open={props.open}
		title={LNG('settings.title')}
		onEscape={() => !loading && closeWindow()}
		separators
		buttons={[
			{
				color: 'neutral',
				text: LNG('settings.button.cancel'),
				onClick: closeWindow,
				disabled: loading
			}, {
				color: 'positive',
				text: LNG('settings.button.save'),
				onClick: handleSave,
				disabled: loading || !passAll
			}
		]}
		width='calc(100% - 48px)'
		maxWidth='800px'
		height='calc(100% - 96px)'
		maxHeight='unset'
	>
		<SettingsForm prefs={prefs} entries={prefDefs} ref={ref} retrievePassAll={setPassAll} />
	</Dialog>
}
