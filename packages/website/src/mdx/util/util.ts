import { useRef, useMemo } from "react"

export module Util {
	export function formatLoadingCode(str: string) {
		const lines = str.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n")
		let lastCode = lines.filter((line) => {
			const comments = ['highlight-start', 'highlight-end', 'highlight-next-line', 'strip-start', 'strip-end', 'preserve-start', 'preserve-end']
			if(line.startsWith('//')) {
				if(comments.includes(line.substring(2).trim())) {
					return false
				}
			}
			return true
		}).join("\n")
		if(lastCode.length > 0 && lastCode[lastCode.length - 1] != "\n") {
			lastCode += "\n"
		}
		return lastCode
	}
	export function codePreserved(str: string) {
		const lines = str.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n")
		for(let line of lines) {
			const comments = ['preserve-begin', 'preserve-end']
			if(line.startsWith('//')) {
				if(comments.includes(line.substring(2).trim())) {
					return true
				}
			}
		}
		return false
	}

	/**
	 * 记忆渲染函数中的方法
	 * 
	 * useMethod 以一个函数为参数，且返回相同类型的函数。在同一个组件生命周期中，返回的函数保持恒定，但是执行时会始终指向最新的函数。
	 */
	export function useMethod<T extends Function>(val: T): T {
		const realFuncRef = useRef(val)
		realFuncRef.current = val
		const callerFunc = useMemo(() => {
			return function(this: any) {
				return realFuncRef.current.apply(this, arguments)
			}
		}, [])
		return callerFunc as any as T
	}
}
