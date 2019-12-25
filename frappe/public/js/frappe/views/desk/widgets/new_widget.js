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
		if (!this.auto_grid)
			return 'col-sm-4'

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
		this.widget = $(`<div class="widget-box ${this.get_grid()}">
			<div class="widget border new-widget">
			    Add Widget
		    </div>
		</div>`);
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
