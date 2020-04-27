import get_dialog_constructor from './widget_dialog.js';

export default class Widget {
	constructor(opts) {
		Object.assign(this, opts);
		this.make();
	}

	refresh() {
		this.set_title();
		this.set_actions();
		this.set_body();
		this.setup_events();
	}

	get_config() {
		return {
			name: this.name,
			label: this.label
		};
	}

	customize(options) {
		this.in_customize_mode = true;
		this.action_area.empty();

		options.allow_delete &&
			this.add_custom_button(
				'<i class="fa fa-trash" aria-hidden="true"></i>',
				() => this.delete()
			);

		options.allow_sorting &&
			this.add_custom_button(
				'<i class="fa fa-arrows" aria-hidden="true"></i>',
				null,
				"drag-handle"
			);

		if (options.allow_hiding) {
			if (this.hidden) {
				this.widget.removeClass("hidden");
				this.body.css("opacity", 0.5);
				this.title_field.css("opacity", 0.5);
				this.footer.css("opacity", 0.5);
			}
			const classname = this.hidden ? 'fa fa-eye' : 'fa fa-eye-slash';
			this.add_custom_button(
				`<i class="${classname}" aria-hidden="true"></i>`,
				() => this.hide_or_show(),
				"show-or-hide-button"
			);

			this.show_or_hide_button = this.action_area.find(
				".show-or-hide-button"
			);
		}

		options.allow_edit &&
			this.add_custom_button(
				'<i class="fa fa-pencil" aria-hidden="true"></i>',
				() => this.edit()
			);

	}

	make() {
		this.make_widget();
		this.widget.appendTo(this.container);
	}

	make_widget() {
		this.widget = $(`<div class="widget ${
			this.hidden ? "hidden" : ""
		}" data-widget-name=${this.name ? this.name : ''}>
			<div class="widget-head">
				<div class="widget-title ellipsis"></div>
				<div class="widget-control"></div>
			</div>
		    <div class="widget-body">
		    </div>
		    <div class="widget-footer">
		    </div>
		</div>`);

		this.title_field = this.widget.find(".widget-title");
		this.body = this.widget.find(".widget-body");
		this.action_area = this.widget.find(".widget-control");
		this.head = this.widget.find(".widget-head");
		this.footer = this.widget.find(".widget-footer");
		this.refresh();
	}

	set_title() {
		this.title_field[0].innerHTML = this.label;
	}

	add_custom_button(html, action, class_name = "") {
		let button = $(
			`<button class="btn btn-default btn-xs ${class_name}">${html}</button>`
		);
		button.click(event => {
			event.stopPropagation();
			action && action();
		});
		button.appendTo(this.action_area);
	}

	delete() {
		this.widget.addClass("zoomOutDelete");
		// wait for animation
		setTimeout(() => {
			this.widget.remove();
			this.options.on_delete && this.options.on_delete(this.name);
		}, 300);
	}

	edit() {
		const dialog_class = get_dialog_constructor(this.widget_type);

		this.edit_dialog = new dialog_class({
			label: this.label,
			type: this.widget_type,
			values: this.get_config(),
			primary_action: (data) => {
				Object.assign(this, data);
				data.name = this.name;

				this.refresh();
			},
			primary_action_label: __("Save")
		});

		this.edit_dialog.make();
	}

	hide_or_show() {
		if (!this.hidden) {
			this.body.css("opacity", 0.5);
			this.title_field.css("opacity", 0.5);
			this.footer.css("opacity", 0.5);
			this.hidden = true;
		} else {
			this.body.css("opacity", 1);
			this.title_field.css("opacity", 1);
			this.footer.css("opacity", 1);
			this.hidden = false;
		}
		this.show_or_hide_button.empty();

		const classname = this.hidden ? 'fa fa-eye-slash' : 'fa fa-eye';
		$(`<i class="${classname}" aria-hidden="true"></i>`).appendTo(
			this.show_or_hide_button
		);
	}

	setup_events() {
		//
	}

	set_actions() {
		//
	}

	set_body() {
		//
	}
}
