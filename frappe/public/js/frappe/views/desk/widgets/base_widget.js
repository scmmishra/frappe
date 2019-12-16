export default class Widget {
	constructor(opts) {
		Object.assign(this, opts);
		this.make();
	}

	refresh() {
		//
	}

	customize() {

	}

	make() {
		this.make_widget();
		this.widget.appendTo(this.container);
		this.setup_events();
	}

	make_widget() {
		this.widget = $(`<div class="border widget-box">
			<div class="widget-action-area">
				<h4 class="h4 widget-title"></h4>
				<div class="widget-action"></div>
			</div>
		    <div class="widget-body">
		    </div
		</div>`);

		this.title_field = this.widget.find(".widget-title");
		this.body = this.widget.find(".widget-body");
		this.action_area = this.widget.find(".widget-action")
		if(this.options.auto_grid) {
			this.widget.css('grid-area', this.data.name);
		}
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
