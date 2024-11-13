declare global {
	interface Window {
		sendAnalyticsEvent: (name: string) => void
	}
}

export {}
