import React from 'react'

export function SeparatorsReference(props: {}) {
	const lst: React.ReactNode[] = []
	for(let key in sectionSeparatorChars) {
		const ch = key
		const data = sectionSeparatorChars[key]
		const mp = sectionSeparatorCharMap[key]
		lst.push(<tr key={key}>
			<td style={{padding: 'calc(var(--ifm-table-cell-padding) - 0.4em)', lineHeight: 0}}><img alt='preview' style={{height: '2.8em'}} src={data[1] ?? ''} /></td>
			<td><code>{ch}</code></td>
			<td>{data[0] ?? ''}</td>
			<td>{mp[2] ? '+' : ''}</td>
			<td>{mp[3] ? '+' : ''}</td>
			<td>{mp[4] ? '+' : ''}</td>
		</tr>)
	}

	return <>
		<table>
			<tbody>
				<tr>
					<th>预览</th>
					<th>写法</th>
					<th>说明</th>
					<th>开头</th>
					<th>中间</th>
					<th>结尾</th>
				</tr>
				{lst}
			</tbody>
		</table>
	</>
}
export const sectionSeparatorCharMap = {
	'/': ['/', '/', true, true, true],
	'/|': ['/|', '/', false, true, true],
	'|': ['|', '/', false, true, true],
	'||': ['||', '/', false, true, true],
	'|||': ['|||', '/', false, true, true],
	'||:': ['|', '||:', true, true, false],
	':||': [':||', '/', false, true, true],
	':||:': [':||', '||:', false, true, false],
	'/||': ['/||', '/', false, true, true],
	'/||:': ['/||', '||:', true, true, false],
	':/||': [':/||', '/', false, true, true],
	':/||:': [':/||', '||:', false, true, false]
} as {[_: string]: any}
export const sectionSeparatorChars = {
	'/': ['隐藏小节线', require('./assets/separator-x.png').default],
	'/|': ['虚线', require('./assets/separator-xy.png').default],
	'|': ['一般小节线', require('./assets/separator-y.png').default],
	'||': ['分段线', require('./assets/separator-yy.png').default],
	'|||': ['终止线', require('./assets/separator-yyy.png').default],
	'||:': ['反复目标记号', require('./assets/separator-yyz.png').default],
	':||': ['反复指令记号', require('./assets/separator-zyy.png').default],
	':||:': ['双侧反复记号', require('./assets/separator-zyyz.png').default],
	'/||': ['不完整一般小节线', require('./assets/separator-xyy.png').default],
	'/||:': ['不完整反复目标记号', require('./assets/separator-xyyz.png').default],
	':/||': ['不完整反复指令记号', require('./assets/separator-zxyy.png').default],
	':/||:': ['不完整双侧反复记号', require('./assets/separator-zxyyz.png').default]
} as {[_: string]: any}

export function InsertationReference(props: {}) {
	const lst: React.ReactNode[] = []
	for(let key in insertationChars) {
		const ch = key
		const data = insertationChars[key]
		lst.push(<tr key={key}>
			<td style={{padding: 'calc(var(--ifm-table-cell-padding) - 0.4em)', lineHeight: 0}}><img alt='preview' style={{height: '2.0em'}} src={data[1] ?? ''} /></td>
			<td><code>{ch}</code></td>
			<td>{data[0] ?? ''}</td>
		</tr>)
	}

	return <>
		<table>
			<tbody>
				<tr>
					<th>预览</th>
					<th>写法</th>
					<th>说明</th>
				</tr>
				{lst}
			</tbody>
		</table>
	</>
}
export const insertationChars = {
	'&lpr;': ['左括号', require('./assets/insert-lpr.png').default],
	'&rpr;': ['右括号', require('./assets/insert-rpr.png').default],
	'&int;': ['换气记号', require('./assets/insert-int.png').default],
	'&cas;': ['层叠连缀记号', require('./assets/insert-cas.png').default],
} as {[_: string]: any}

export function NoteAttrReference(props: {
	filter?: string
}) {
	let items: any[] = []
	for(let key in noteAttrs) {
		items.push({key: key, val: noteAttrs[key]})
	}
	const newItems: any = []
	items = items.filter((item) => {
		return !props.filter || props.filter == item.val[2]
	})
	items.map((thing, index) => {
		let mappedIndex = 0
		const del = Math.ceil(items.length / 2)
		if(index < del) {
			mappedIndex = 2 * index
		} else {
			mappedIndex = 2 * (index - del) + 1
		}
		newItems[mappedIndex] = thing
	})
	const lst = newItems.map((thing: any, index: number) => {
		if(index % 2 != 0) {
			return undefined
		}

		function thingData(thing: any) {
			const data = thing.val
			return <>
				<td style={{padding: 'calc(var(--ifm-table-cell-padding) - 0.4em)', lineHeight: 0}}><img alt='preview' style={{height: '2.8em'}} src={data[1] ?? ''} /></td>
				<td><code>{thing.key}</code></td>
				<td>{data[0] ?? ''}</td>
			</>
		}
		function noneData() {
			return <>
				<td></td><td></td><td></td>
			</>
		}

		const myThingData = thingData(thing)
		const yourThing = newItems[index + 1]
		const yourThingData = yourThing ? thingData(yourThing) : noneData()
		
		return <tr key={thing.key}>
			{myThingData}
			<td style={{padding: 0}}></td>
			{yourThingData}
		</tr>
	})

	return <>
		<table>
			<tbody>
				<tr>
					<th>预览</th>
					<th>写法</th>
					<th>说明</th>
					<th style={{width: '0.2em', padding: 0}}></th>
					<th>预览</th>
					<th>写法</th>
					<th>说明</th>
				</tr>
				{lst}
			</tbody>
		</table>
	</>
}
export const noteAttrs = {
	'tr': ['颤音', require('./assets/note-tr.png').default, 'feature'],
	'tr+': ['长颤音', require('./assets/note-tr+.png').default, 'feature'],
	'wav': ['波音', require('./assets/note-wav.png').default, 'feature'],
	'wav+': ['长波音', require('./assets/note-wav+.png').default, 'feature'],
	'wavd': ['下波音', require('./assets/note-wavd.png').default, 'feature'],
	'wavd+': ['长下波音', require('./assets/note-wavd+.png').default, 'feature'],
	'echo': ['回音', require('./assets/note-echo.png').default, 'feature'],
	'recho': ['逆回音', require('./assets/note-recho.png').default, 'feature'],
	'ext': ['自由延长', require('./assets/note-ext.png').default, 'feature'],
	'hold': ['保持咬字状态与音量', require('./assets/note-hold.png').default, 'feature'],
	'str': ['重音，着重', require('./assets/note-str.png').default, 'feature'],
	'brk': ['顿音，突强且短促', require('./assets/note-brk.png').default, 'feature'],
	'tip': ['跳音，短促', require('./assets/note-tip.png').default, 'feature'],
	'sl': ['上滑音', require('./assets/note-sl.png').default, 'feature'],
	'sld': ['下滑音', require('./assets/note-sld.png').default, 'feature'],
	'(3)': ['前倚音', require('./assets/note-pre.png').default, 'decor'],
	'p(3)': ['后倚音', require('./assets/note-post.png').default, 'decor']
} as {[_: string]: any}

export function ForceReference(props: {}) {
	let items: any[] = []
	for(let key in forces) {
		items.push({key: key, val: forces[key]})
	}
	const newItems: any = []
	items.map((thing, index) => {
		let mappedIndex = 0
		const del = Math.ceil(items.length / 2)
		if(index < del) {
			mappedIndex = 2 * index
		} else {
			mappedIndex = 2 * (index - del) + 1
		}
		newItems[mappedIndex] = thing
	})
	const lst = newItems.map((thing: any, index: number) => {
		if(index % 2 != 0) {
			return undefined
		}

		function thingData(thing: any) {
			const data = thing.val
			return <>
				<td style={{padding: 'calc(var(--ifm-table-cell-padding) - 0.4em)', lineHeight: 0}}><img alt='preview' style={{height: '1.5em'}} src={data[2] ?? ''} /></td>
				<td><code>{thing.key}</code></td>
				<td>{data[0] == data[1] ? data[0] : data[0] + '/' + data[1]}</td>
			</>
		}
		function noneData() {
			return <>
				<td></td><td></td><td></td>
			</>
		}

		const myThingData = thingData(thing)
		const yourThing = newItems[index + 1]
		const yourThingData = yourThing ? thingData(yourThing) : noneData()
		
		return <tr key={thing.key}>
			{myThingData}
			<td style={{padding: 0}}></td>
			{yourThingData}
		</tr>
	})

	return <>
		<table>
			<tbody>
				<tr>
					<th>预览</th>
					<th>写法</th>
					<th>力度权重</th>
					<th style={{width: '0.2em', padding: 0}}></th>
					<th>预览</th>
					<th>写法</th>
					<th>力度权重</th>
				</tr>
				{lst}
			</tbody>
		</table>
	</>
}
export const forces = {
	'ppp': [-25, -25, require('./assets/force-ppp.png').default],
	'pp': [-20, -20, require('./assets/force-pp.png').default],
	'p': [-15, -15, require('./assets/force-p.png').default],
	'mp': [-5, -5, require('./assets/force-mp.png').default],
	'm': [0, 0, require('./assets/force-m.png').default],
	'mf': [5, 5, require('./assets/force-mf.png').default],
	'f': [15, 15, require('./assets/force-f.png').default],
	'ff': [20, 20, require('./assets/force-ff.png').default],
	'fff': [25, 25, require('./assets/force-fff.png').default],
	'sf': [32, 32, require('./assets/force-sf.png').default],
	'fz': [35, 35, require('./assets/force-fz.png').default],
	'sfz': [38, 38, require('./assets/force-sfz.png').default],
	'sfzz': [42, 42, require('./assets/force-sfzz.png').default],
	'fp': [15, -15, require('./assets/force-fp.png').default],
	'fpp': [15, -20, require('./assets/force-fpp.png').default],
	'sfp': [32, -15, require('./assets/force-sfp.png').default],
	'sfpp': [32, -20, require('./assets/force-sfpp.png').default],
	'rf': [15, 15, require('./assets/force-rf.png').default],
	'rfs': [32, 32, require('./assets/force-rfs.png').default],
} as {[_: string]: any}
