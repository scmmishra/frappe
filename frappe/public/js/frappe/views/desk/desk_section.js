import { get_widget_class } from "./widgets";

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
		function add(a, b) {
			return a + b;
		}

		const grid_max_cols = 6

		const width_map = {
			'one-third': 2,
			'two-third': 4,
			'half': 3,
			'full': 6
		}

		let data = this.widget_config.map((widget, index) => {
			return {
				name: widget.name || `grid`,
				columns: width_map[widget.width] || 2,
				rows: 1
			}
		})


		// Split the data into multiple arrays
		// Each array will contain grid elements of one row
		let processed = []
		let temp = []
		let init = 0
		data.forEach((data) => {
			init = init + data.columns;
			if (init > grid_max_cols) {
				init = data.columns
				processed.push(temp)
				temp = []
			}
			temp.push(data)
		})

		processed.push(temp)

		let grid_template = [];

		processed.forEach((data, index) => {
			let aa = data.map(dd => {
				return Array.apply(null, Array(dd.columns)).map(String.prototype.valueOf, dd.name)
			}).flat()

			if (aa.length < grid_max_cols) {
				let diff = grid_max_cols - aa.length;
				for (let ii = 0; ii < diff; ii++) {
					aa.push(`grid-${index}-${ii}`)
				}
			}

			grid_template.push(aa.join(" "))
		})
		let grid_template_area = ""

		grid_template.forEach(temp => {
			grid_template_area += `"${temp}" `
		})

		console.log(grid_template_area)
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
		this.grid_config && this.modules_container.css('grid-template-columns', this.grid_config.column || 'repeat(3, 1fr)')
	}

	make_module_widget() {
		this.widget_config.forEach((wid, index) => {
			let widget_class = get_widget_class(wid.type);
			let widget = new widget_class({
				container: this.modules_container,
				data: {
					...wid,
					index: index,
					auto_grid: this.auto_grid
				}
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
				this.sortable_config.after_sort(container, this.options);
			}
		});
	}

	customize() {
		this.widgets_list.forEach(wid => {
			wid.customize();
		});
	}
}
