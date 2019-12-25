import { generate_route } from "./widgets/utils";
import DeskSection from "./desk_section";

export default class ModulesPage {
	constructor({ parent }) {
		this.parent = $(parent);
		this.page = parent.page;

		this.init();
		this.sections = {};

		this.setup_header();
		this.make();
		window.mod = this;
	}

	init() {
		frappe.module_links = {};
		this.modules_container = this.parent.find(".layout-main");
		this.make_container();
		this.module_name = frappe.get_route()[1];

		this.modules_list = frappe.boot.allowed_modules.filter(
			d => (d.type === "module" || d.category === "Places") && !d.blocked
		);
		this.module = this.modules_list.filter(
			m => m.module_name == this.module_name
		)[0];
	}

	setup_header() {
		let title = this.module.label || this.module_name;
		this.page.set_title(title);
	}

	refresh() {
		this.cards_container.empty();
		this.make();
	}

	make() {
		this.setup_loading();
		this.get_moduleview_data().then(() => {
			this.hide_loading();
			this.setup_customize_button();
			this.make_sections();
		});
	}

	get_moduleview_data() {
		const process_module_data = data => {
			data.forEach(widget => {
				widget.name = frappe.scrub(widget.title || widget.label);
				widget.options = {
					links: widget.items.map(item => {
						item.route = generate_route(item);
						return item;
					})
				};
				widget.type = "module_details";
				widget.width = "auto";
				delete widget.items;
			});

			return data;
		};

		const process_chart_data = data => {
			return data.map((chart, index) => {
				return {
					name: `chart-${index}`,
					label: chart.chart,
					type: "chart",
					width: chart.width,
					options: {
						chart_name: chart.chart
					}
				};
			});
		};

		return frappe
			.call("frappe.desk.moduleview.get", {
				module: this.module_name
			})
			.then(res => {
				this.moduleview_data = process_module_data(res.message.data);
				this.chart_data = process_chart_data(res.message.dashboard);
			});
	}

	make_container() {
		this.modules_container.replaceWith(
			'<div class="modules-page-container"></div>'
		);
		this.cards_container = this.parent.find(".modules-page-container");
	}

	setup_loading() {
		this.loading = $(`<div><div class="widgets-container section-loading">
			<div class="widget-box col-sm-4"><div class="skeleton-widget-box"></div></div>
			<div class="widget-box col-sm-4"><div class="skeleton-widget-box"></div></div>
			<div class="widget-box col-sm-4"><div class="skeleton-widget-box"></div></div>
		</div></div>`);

		this.loading.appendTo(this.cards_container);
	}

	setup_customize_button() {
		// const label = this.chart_data.length
		// 	? "Customize"
		// 	: "Configure Dashboard";
		const label = "Customize"
		this.customize_button = this.page.set_secondary_action(label, () => {
			this.customize();
		});
	}

	hide_loading() {
		this.loading && this.loading.remove();
	}

	make_sections() {
		this.sections["dashboard"] = new DeskSection({
			title: `${this.module.label || this.module_name} Dashboard`,
			hide_title: true,
			allow_creation: true,
			on_create: () => {
				console.log('create')
			},

			allow_deletion: true,
			on_delete: () => {
				console.log('delete')
			},

			allow_sorting: true,
			sorting_enabled_by_default: false,
			drag_handle: '.drag-handle',
			on_sort: (container) => {
				console.log(sort)
			},

			widget_config: this.chart_data,
			container: this.cards_container,
		});

		this.sections["module_items"] = new DeskSection({
			title: "Module Items",
			hide_title: !this.chart_data.length,
			widget_config: this.moduleview_data,
			container: this.cards_container,
			allow_sorting: true,
		});
	}

	customize() {
		this.sections.dashboard.customize()
		this.sections["module_items"].customize()
	}
}