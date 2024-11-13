/**
 * 统计项目：
 * Download 下载预构建
 * Download sources 在 Windows/Linux 下载源代码
 * Download sources MacOS 在 MacOS 下载源代码
 * Try yourself 点击自行尝试按钮
 * Try example 尝试例子
 * Example link 点击示例乐谱链接
 * Example launch 点击示例乐谱启动
 */

/**
 * 发送统计数据事件
 */
window.sendAnalyticsEvent = (name) => {
	if(window.umami) {
		console.log('Track event ' + name)
		umami.track(name)
	}
}
