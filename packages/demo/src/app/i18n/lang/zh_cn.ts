import { flattenI18nData } from "../i18n";

const selfName = "简体中文 (中国)"
const appName = 'Sparks NMN 试用模式'
const appNameShort = 'Sparks NMN'
const appNameShortExt = '试用模式'
export default flattenI18nData({
	"i18n.self_name": selfName,

	"title": {
		"default": appName,
		"new": "" + appName,
		"newDirty": "● " + appName,
	},
	
	// 预览
	"preview": {
		"new_title": "新文档",
		"heading#html": {
			"icon": "./logo.ico",
			"backlink": "/",
			"title": appNameShort,
			"title_ext": appNameShortExt,
			"text": {
				"1": "此页面不支持文件保存和偏好设置功能。要留存文件，可复制代码并使用自己的文本编辑器保存。",
				"2": "本页面上的暂存功能利用浏览器的本地存储，只能存放<strong style='font-weight: 500; text-decoration: wavy #7d9198 underline'>一份</strong>代码，且<strong style='font-weight: 500; text-decoration: wavy #7d9198 underline'>随时都可能会被覆盖</strong>。请注意做好备份。",
				"3": "如需要日常使用，建议下载桌面版。"
			},
			"key": {
				"save": "暂存代码并刷新预览",
				"refresh": "仅刷新预览",
				"print": "打印预览",
				"hint": "如果没有键盘，也可以点击状态栏上的「未暂存」或「未刷新预览」进行暂存或刷新。"
			}
		}
	},

	// 导出完成
	"export_finish": "音频数据导出完成，请复制下面地址访问。\n链接将在 2 分钟内失效。"
})
