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

	make() {
		this.make_container();
		this.setup_loading();
		this.get_moduleview_data().then(() => {
			this.hide_loading();
			this.setup_customize_button();
			this.make_sections();
		});
	}

	get_moduleview_data() {
		const process_data = data => {
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

		return frappe
			.call("frappe.desk.moduleview.get", {
				module: this.module_name
			})
			.then(res => {
				this.moduleview_data = process_data(res.message);
			});
	}

	make_container() {
		this.modules_container.replaceWith(
			'<div class="modules-list-container"></div>'
		);
		this.cards_container = this.parent.find(".modules-list-container");
	}

	setup_loading() {
		this.loading = $(`<div><div class="modules-container section-loading">
			<div class="skeleton-widget-box"></div>
			<div class="skeleton-widget-box"></div>
			<div class="skeleton-widget-box"></div>
		</div></div>`);

		this.loading.appendTo(this.cards_container);
	}

	setup_customize_button() {
		this.customize_button = this.page.set_secondary_action(
			"Customize",
			() => {
				this.customize();
			}
		);
	}

	customize() {
		this.customize_button.remove();
		this.sections.dashboard.customize();
		this.canel = this.page.set_secondary_action("Customize", () => {
			this.customize();
		});
	}

	hide_loading() {
		this.loading && this.loading.remove();
	}

	make_sections() {
		this.sections["module_items"] = new DeskSection({
			title: "Module Items",
			hide_title: true,
			options: {},
			widget_config: this.moduleview_data,
			container: this.cards_container,
			sortable_config: {
				enable: true
			}
		});
	}
}
