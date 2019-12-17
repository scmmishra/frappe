import { get_widget_class } from "./widgets";
import { generate_grid } from "./widgets/utils";

export default class DeskSection {
	constructor(opts) {
		Object.assign(this, opts);
		this.widgets = {};
		this.widgets_list = [];
		this.make();
	}

	make() {
		this.make_container();
		// this.auto_grid ? this.build_grid() : this.setup_grid();
		this.make_module_widget();
		this.sortable_config.enable && this.setup_sortable();
	}

	refresh() {
		this.widgets_container.empty()
		this.make()
	}

	build_grid() {
		console.log("building grid")
		const width_map = {
			'One Third': 2,
			'Two Third': 4,
			'Half': 3,
			'Full': 6
		}

		let data = this.widget_config.map((widget, index) => {
			return {
				name: widget.name || `grid`,
				columns: width_map[widget.width] || 2,
				rows: 1
			}
		})

		let grid_template_area = generate_grid(data)

		this.widgets_container.css('grid-template-columns','repeat(6, 1fr)')
		this.widgets_container.css('grid-template-areas', grid_template_area)
	}

	make_container() {
		const get_title = () => {
			return `<div class="section-header level text-muted">
				<div class="module-category h6 uppercase">${__(this.title)}</div>
			</div>`;
		};

		this.section_container = $(`<div class="widgets-section">
			${this.hide_title ? "" : get_title()}
			<div class="widgets-container row"></div>
		</div>`);

		this.widgets_container = this.section_container.find(
			".widgets-container"
		);

		this.section_container.appendTo(this.container);
	}

	make_module_widget() {
		this.widget_config.forEach((wid, index) => {
			let widget_class = get_widget_class(wid.type);
			let widget = new widget_class({
				container: this.widgets_container,
				...wid,
				auto_grid: this.auto_grid
			});

			this.widgets[wid.module_name] = widget;
			this.widgets_list.push(widget);
		});
	}

	setup_sortable() {
		const container = this.widgets_container[0];
		this.sortable = new Sortable(container, {
			animation: 150,
			onEnd: () => {
				this.sortable_config.after_sort && this.sortable_config.after_sort(container);
			},
			// onChoose: (evt) => this.sortable_config.on_choose(evt, container),
			// onStart: (evt) => this.sortable_config.on_start(evt, container)
		});
	}

	customize() {
		this.widgets_list.forEach(wid => {
			wid.customize();
		});
	}
}
