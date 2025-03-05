import { inCheck } from "@sparks-notation/util/array";
import { LyricDestructionType } from "../types";
import { TokenType } from "../../tokenizer/tokenizer";

export type LrcSymbolType = 'word' | 'prefix' | 'postfix' | 'divide' | 'placeholder'

/**
 * 确定歌词中某种字符的类型
 */
export function getLrcSymbolType(
	symbol: string, typeSampler: LyricDestructionType, tokenType: TokenType | undefined
): LrcSymbolType {
	if(['_', '%'].indexOf(symbol) != -1 && tokenType != 'stringLiteral') {
		return 'placeholder'
	}
	if(symbol == "'") {
		if(typeSampler == 'word') {
			return 'word'
		} else {
			return 'postfix'
		}
	}
	if([
		')', ']', ']]', '}',
		'~', '—', '%',
		'!', '！',
		'^', '…',
		';', '；',
		':', '：',
		'）', '>', '》', '⟩', '⟧', '⟫' ,'⟭', '〉', '』', '〗', '】', '〙', '」', '〕', '〛',
		',', '，',
		'.', '。',
		'”', '’',
		'?', '？'
	].indexOf(symbol) != -1) {
		return 'postfix'
	}
	if([
		'(', '[', '[[', '[',
		'（', '<', '《', '⟨', '⟦', '⟪', '⟬', '〈', '『', '〖', '【', '〘', '「', '〔', '〚',
		'“', '‘',
		'@', '#', '￥', '&', '$'
	].indexOf(symbol) != -1) {
		return 'prefix'
	}
	if([
		' ', '-', '_', "\\", '|', '/', '+', '='
	].indexOf(symbol) != -1) {
		return 'divide'
	}
	return 'word'
}

/**
 * 查找歌词前后缀字符的测量等价类
 * 
 * 注：目的是将中文全角标点当作半角标点测量，以避免其占据不必要的排版空间。
 */
export function getLrcSymbolEquivalent(symbol: string) {
	let symbolMap: {[_: string]: string} = {
		'，': ',',
		'。': '.',
		'！': '!',
		'？': '?',
		'：': ':',
		'；': ';',
		'（': '(',
		'）': ')',
		'『': '(',
		'「': '(',
		'』': ')',
		'」': ')',
		'《': '⟪',
		'》': '⟫',
		'〈': '⟨',
		'〉': '⟩',
		'“': '"',
		'”': '"',
		'‘': '"',
		'’': '"'
	}
	if(inCheck(symbol, symbolMap)) {
		return symbolMap[symbol]
	}
	return symbol
}
