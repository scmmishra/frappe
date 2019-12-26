import { get_widget_class } from "./widgets";
import { generate_grid } from "./widgets/utils";

export default class DeskSection {
	constructor(opts) {
		Object.assign(this, opts);
		this.widgets = {};
		this.widgets_list = [];
		this.make();
	}

	refresh() {
		this.widgets_container.empty()
		this.make()
	}

	make() {
		this.customize_mode = 0;
		this.prepare_container();
		this.make_widgets();
		this.sorting_enabled_by_default && this.setup_sortable();
	}

	prepare_container() {
		this.section_container = $(`<div class="widgets-section">
			<div class="section-header level text-muted">
				<div class="module-category h6 uppercase">${__(this.title)}</div>
			</div>
			<div class="widgets-container row"></div>
		</div>`);

		this.section_header = this.section_container.find(".section-header")
		this.widgets_container = this.section_container.find(
			".widgets-container"
		);

		this.hide_title && this.hide_header();

		this.section_container.appendTo(this.container);
	}

	show_header() {
		this.section_header.show();
	}

	hide_header() {
		this.section_header.hide();
	}

	add_widget(config) {
		let widget_class = get_widget_class(config.type);

		let widget = new widget_class({
			container: this.widgets_container,
			...config,
		});

		this.widgets[config.name] = widget;
		this.widgets_list.push(widget);

		return widget
	}

	make_widgets() {
		if (this.widget_config.length) {
			this.widget_config.forEach((wid, index) => {
				this.add_widget(wid)
			});
		}
	}

	show_widgets() {
		this.widgets_container.show();
	}

	hide_widgets() {
		this.widgets_container.hide();
	}

	setup_sortable() {
		const container = this.widgets_container[0];
		this.sortable = new Sortable(container, {
			handle: this.drag_handle || null,
			animation: 150,
			onEnd: () => {
				this.on_sort && this.on_sort(container);
			},
		});
	}

	customize() {
		if (this.customize_mode) {
			return
		}

		this.show_header()
		const get_new_width = () => {
			const width_map = {
				'One Third': 2,
				'Two Third': 4,
				'Half': 3,
				'Full': 6
			}

			const conv_width_map = {
				2: 'One Third',
				4: 'Two Third',
				3: 'Half',
				6: 'Full'
			}

			const data = this.widget_config.map((widget, index) => {
				return {
					name: widget.name || `grid`,
					columns: width_map[widget.width] || 2
				}
			})

			const total = data.reduce((acc, val) => acc + val, 0)
			return conv_width_map[6 - total % 6]
		}

		this.allow_creation && this.add_widget({ type: 'new', name: 'new', width: get_new_width(), on_create: this.on_create })
		this.allow_sorting && this.setup_sortable()

		this.widgets_list.forEach(wid => {
			wid.customize();
		});
		this.customize_mode = 1;
	}
}
