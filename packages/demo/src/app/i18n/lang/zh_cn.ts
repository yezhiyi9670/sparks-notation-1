import { flattenI18nData } from "../i18n";

const selfName = "简体中文 (中国)"
const appName = 'Sparks NMN Playground'
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
		"warning": "重要提醒：\n此试用版本仅用于试验与学习，不支持文件保存和偏好设置。如需日常使用，应当下载桌面版。\n文件会以非常不靠谱的方式暂存在浏览器上，随时都可能会被覆盖。\n【Ctrl + S 暂存文件并刷新预览，Ctrl + R 只刷新不保存，Ctrl + P 打印预览】\n【点击状态栏的“未暂存”或“未刷新预览”也可以执行暂存或刷新操作】",
	},

	// 导出完成
	"export_finish": "音频数据导出完成，请复制下面地址访问。\n链接将在 2 分钟内失效。"
})
