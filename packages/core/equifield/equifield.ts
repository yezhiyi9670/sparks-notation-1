import jquery from 'jquery'
import './equifield.css'

export type EquifieldSection = {
	element: HTMLElement
	height: number
	breakAfter?: 'always' | 'avoid'
	isMargin?: boolean
	label?: string
	localeLabel?: string
	padding?: [number, number]
}

export class Equifield {
	element: HTMLDivElement
	listener: () => void

	constructor(element: HTMLDivElement) {
		this.element = element
		jquery(this.element)
			.addClass('wcl-equifield-root')
		this.listener = () => {
			this.resize()
		}
		addEventListener('resize', this.listener)
		this.resize()
	}

	resize() {
		const $element = jquery(this.element)
		let width = this.element.offsetWidth
		if(width > 0) {
			$element.css('font-size', `${width / 64}px`)
		}
	}
	
	destroy() {
		removeEventListener('resize', this.listener)
		jquery(this.element).removeClass('wcl-equifield-root')
	}

	render(sections: EquifieldSection[]) {
		const $element = jquery(this.element)
		$element.children().each(function(index) {
			if(!jquery(this).hasClass('wcl-equifield-preserve')) {
				jquery(this).remove()
			}
		})
		
		let totalHeight = 0
		sections.forEach((section, index) => {
			const sectionPadding = section.padding ?? [0, 0]

			const $content = jquery('<div></div>').addClass('wcl-equifield-content')
			const targetElement = section.element
			$content[0].appendChild(targetElement)
			const $field = jquery('<div></div>').addClass('wcl-equifield-field').css({
				fontSize: `${64 / (100 + sectionPadding[0] + sectionPadding[1])}em`,
				height: `${section.height}em`,
				// containIntrinsicHeight: `${section.height}em`,
				paddingLeft: `${sectionPadding[0]}em`,
				paddingRight: `${sectionPadding[1]}em`
			})
				.append(
					$content
				)
			if(section.label) {
				$field.attr('data-label', section.label)
			}
			if(section.breakAfter == 'avoid') {
				$field.css('page-break-after', 'avoid')
			} else if(section.breakAfter == 'always') {
				$field.css('page-break-after', 'always')
			}
			$element.append(
				$field
			)
			totalHeight += section.height
		})
	}
}
