import { get_widget_class } from "./widgets";

export default class DeskSection {
	constructor(opts) {
		Object.assign(this, opts);
		this.widgets = {};
		this.make();
	}

	make() {
		this.make_container();
		this.build_grid();
		this.make_module_widget();
		this.sortable_config.enable && this.setup_sortable();
	}

	build_grid() {
		function add(a, b) {
			return a + b;
		}

		const grid_max_cols = 3

		let data = this.widget_config.map((widget, index) => {
			return {
				name: widget.name || `grid`,
				columns: widget.columns || 1,
				rows: widget.rows || 1,
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

		processed.forEach(data => {
			let max = Math.max.apply(null, data.map(a => a.rows));

			for (let cur_idx = 0; cur_idx < max; cur_idx++) {
				let aa = data.map(dd => {
					if (dd.rows > cur_idx) {
						return Array.apply(null, Array(dd.columns)).map(String.prototype.valueOf, dd.name)
					} else {
						return Array.apply(null, Array(dd.columns)).map(String.prototype.valueOf, '---')
					}
				}).flat()

				if (aa.length < grid_max_cols) {
					let diff = grid_max_cols - aa.length;
					for (let ii = 0; ii < diff; ii++) {
						aa.push(`---`)
					}
				}

				grid_template.push(aa.join(" "))
			}
		})
		let grid_template_area = ""

		grid_template.forEach(temp => {
			grid_template_area += `"${temp}" `
		})

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

	// setup_grid() {
	// 	this.modules_container.css('grid-template-columns', this.grid_config.column || 'repeat(3, 1fr)')
	// }

	make_module_widget() {
		this.widget_config.forEach((wid, index) => {
			let widget_class = get_widget_class(wid.type);
			this.widgets[wid.module_name] = new widget_class({
				container: this.modules_container,
				data: {
					...wid,
					index: index
				}
			});
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
}
