export default class Widget {
	constructor(opts) {
		Object.assign(this, opts);
		this.make();
	}

	refresh() {
		//
	}

	customize() {
		this.action_area.empty()
		if (this.allow_sorting) {
			const drag_handle = $(`<button style="cursor: move;" class="btn btn-secondary btn-default btn-xs drag-handle ml-2">
				<i class="fa fa-bars" aria-hidden="true"></i>
			</button>`);
			drag_handle.appendTo(this.action_area);
		}

		if (this.allow_delete) {
			const delete_button = $(`<button class="btn btn-secondary btn-light btn-danger btn-xs ml-2"><i class="fa fa-trash" aria-hidden="true"></i></button>`);
			delete_button.on('click', () => this.remove())
			delete_button.appendTo(this.action_area);
		}
	}

	remove() {
		this.widget.remove()
		this.on_delete && this.on_delete(this.name)
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
		this.widget = $(`<div class="widget-box ${this.get_grid()}"
				data-widget-name="${this.name}"
			>
			<div class="widget border">
				<div class="widget-action-area">
					<h4 class="h4 widget-title"></h4>
					<div class="widget-action"></div>
				</div>
			    <div class="widget-body">
			    </div>
		    </div>
		</div>`);

		this.title_field = this.widget.find(".widget-title");
		this.body = this.widget.find(".widget-body");
		this.action_area = this.widget.find(".widget-action")
		this.set_title();
		this.set_actions();
		this.set_body();
	}

	set_title() {
		this.title_field[0].innerHTML = this.label || this.name;
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
