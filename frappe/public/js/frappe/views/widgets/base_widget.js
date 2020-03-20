export default class Widget {
	constructor(opts) {
		Object.assign(this, opts);
		this.make();
		window.wid = this;
	}

	refresh() {
		//
	}

	customize(options) {
		this.action_area.empty()
		let delete_button = $(`<button class="btn btn-secondary btn-light btn-danger btn-xs"><i class="fa fa-trash" aria-hidden="true"></i></button>`);
		delete_button.on('click', () => this.delete())
		delete_button.appendTo(this.action_area);
	}

	make() {
		this.make_widget();
		this.widget.appendTo(this.container);
		this.setup_events();
	}

	make_widget() {
		this.widget = $(`<div class="widget">
			<div class="widget-head">
				<div class="widget-title"></div>
				<div class="widget-control"></div>
			</div>
		    <div class="widget-body">
		    </div>
		</div>`);

		this.title_field = this.widget.find(".widget-title");
		this.body = this.widget.find(".widget-body");
		this.action_area = this.widget.find(".widget-control");
		this.head = this.widget.find(".widget-head");
		this.set_title();
		this.set_actions();
		this.set_body();
	}

	set_title() {
		this.title_field[0].innerHTML = this.label || this.name;
	}

	delete() {
		this.widget.remove();
		this.on_delete && this.on_delete(this.name);
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