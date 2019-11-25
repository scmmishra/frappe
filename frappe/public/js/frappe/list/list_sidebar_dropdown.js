export default class ListSidebarDropdown {
	constructor(opts) {
		Object.assign(this, opts);
		window.dropdown = this;
		this.make();
	}

	make() {
		let list_body = this.list_items.length
							? this.build_list_items()
							: this.build_empty_state()
		this.render_list(list_body)
	}

	render_list(list) {
		const dropdown_html = `
			<div class="btn-group">
				<a class="dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
					${ this.label } <span class="caret"></span>
				</a>
				<ul class="dropdown-menu calendar-dropdown" style="max-height: 300px; overflow-y: auto;">
					<div class="dropdown-search">
						<input type="text" placeholder="Search" class="form-control dropdown-search-input input-xs">
					</div>
					${list}
				</ul>
			</div>
		`;

		$('.dropdown-search').on('click',(e)=>{
			e.stopPropagation();
		});

		this.wrapper.html(dropdown_html);
	}

	build_list_items() {
		function default_format(doctype, item) {
			return `<li>${item}</li>`
		}

		let formatted_list = this.list_items.map(item => {
			return this.formatter ? this.formatter(this.doctype, item) : default_format(this.doctype, item)
		}).join(' ')

		return formatted_list
	}

	build_empty_state() {
		const message = this.empty_message || __('List Empty')

		return `<li class="text-muted p-2 text-center" style="padding: 1em !important;text-align: center;">
			${message}
		</li>`
	}
}