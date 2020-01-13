export default class NewWidget {
	constructor(opts) {
		Object.assign(this, opts);
		this.make();
	}

	refresh() {
		//
	}

	customize() {
		return
	}

	make() {
		this.make_widget();
		this.widget.appendTo(this.container);
		this.setup_events();
	}

	get_grid() {
		const width_map = {
			'One Third': 'col-sm-4',
			'Two Third': 'col-sm-8 ',
			'Half': 'col-sm-6',
			'Full': 'col-sm-12',
			'auto': 'col-sm-4'
		}

		return width_map[this.width] || 'col-sm-4'
	}

	make_widget() {
		this.widget = $(`<div class="widget-box ${this.get_grid()}" data-widget-name="${this.name}">
			<div class="widget border new-widget">
			    Add Widget
		    </div>
		</div>`);

		this.widget.on('click', () => {
			this.on_create()
		})
	}

	set_actions() {
		//
	}

	set_body() {
		//
	}

	setup_events() {
		//
	}
}
