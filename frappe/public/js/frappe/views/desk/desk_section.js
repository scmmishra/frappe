import { get_widget_class } from "./widgets";
import { generate_route } from "./widgets/utils";

export default class DeskSection {
	constructor(opts) {
		Object.assign(this, opts);
		this.widgets = {};
		this.widgets_list = [];
		this.make();
	}

	make() {
		this.make_container();
		this.auto_grid ? this.build_grid() : this.setup_grid();
		this.make_module_widget();
		this.sortable_config.enable && this.setup_sortable();
	}

	build_grid() {
		let data = this.widget_config.map((widget, index) => {
			return {
				name: widget.name || `grid`,
				columns: width_map[widget.width] || 2,
				rows: 1
			}
		})

		grid_template_area = generate_grid(data)

		this.modules_container.css('grid-template-columns','repeat(6, 1fr)')
		this.modules_container.css('grid-template-areas', grid_template_area)
	}

	make_container() {
		const get_title = () => {
			return `<div class="section-header level text-muted">
				<div class="module-category h6 uppercase">${__(this.title)}</div>
			</div>`;
		};

		this.section_container = $(`<div class="modules-section">
			${this.hide_title ? "" : get_title()}
			<div class="modules-container"></div>
		</div>`);

		this.modules_container = this.section_container.find(
			".modules-container"
		);

		this.section_container.appendTo(this.container);
	}

	setup_grid() {
		this.grid_config && this.modules_container.css('grid-template-columns', this.grid_config.column || 'repeat(auto-fill, minmax(300px, 1fr))')
	}

	make_module_widget() {
		this.widget_config.forEach((wid, index) => {
			let widget_class = get_widget_class(wid.type);
			let widget = new widget_class({
				container: this.modules_container,
				...wid,
				auto_grid: this.auto_grid
			});

			this.widgets[wid.module_name] = widget;
			this.widgets_list.push(widget);
		});
	}

	setup_sortable() {
		const container = this.modules_container[0];
		this.sortable = new Sortable(container, {
			animation: 150,
			onEnd: () => {
				this.sortable_config.after_sort(container);
			}
		});
	}

	customize() {
		this.widgets_list.forEach(wid => {
			wid.customize();
		});
	}
}
