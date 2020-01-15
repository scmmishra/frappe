import { get_widget_class } from "./widgets";

export default class Desk {
	constructor({ container }) {
		this.wrapper = $(container);
		this.module_categories = [
			"Modules",
			"Domains",
			"Places",
			"Administration"
		];
		this.sections = {};
		this.make();
		window.desk =this;
	}

	refresh() {
		this.container &&
			this.container.remove();
		this.make();
	}

	make() {
		this.fetch_desktop_settings().then(() => {
			this.make_container();
			this.make_sidebar();
			this.make_menu();
			// this.setup_events();
		});
	}

	make_sidebar() {
		this.sidebar_items.forEach(item => {
			this.add_sidebar_item(item)
		})
	}

	add_sidebar_item(item) {
		let $item = $(`<div class="sidebar-item h4 ellipsis ${item.label == "Getting Started" ? 'active' : '' }">
					<i class="${item.icon ? item.icon : 'fa fa-check-square-o'} text-muted"></i>
					${ item.label ? item.label : item.name }
				</div>`);

		$item.appendTo(this.sidebar);
	}


	fetch_desktop_settings() {
		let process_desktop_settings = settings => {
			let sidebar_items = [];
			this.module_categories.forEach(category => {
				if (settings.hasOwnProperty(category)) {
					sidebar_items.push(...settings[category].map(item => {
						return {
							name: item.module_name,
							label: item.label,
							type: item.type,
							icon: item.icon,
						};
					}));
				}
			});

			return sidebar_items.filter((item) => {
				return item.type == "module"
			});
		};

		return frappe
			.call("frappe.desk.moduleview.get_desktop_settings")
			.then(response => {
				if (response.message) {
					this.sidebar_items = process_desktop_settings(
						response.message
					);
				}
			});
	}

	make_container() {
		this.container = $(`<div class="desk-page-container row">
				<div class="col-md-2 desk-sidebar">
				</div>
				<div class="col-md-10 desk-menu-area">
				</div>
			</div>`);

		this.container.appendTo(this.wrapper);
		this.sidebar = this.container.find(".desk-sidebar");
		this.menu_area = this.container.find(".desk-menu-area");
	}

	make_menu() {
		let widget_class = get_widget_class('chart');

		let widget = new widget_class({
			container: this.menu_area,
			label: "Incoming Bills (Purchase Invoice)",
			type: "chart",
			width: "Full",
			options: {
				chart_name: "Incoming Bills (Purchase Invoice)"
			},
		});
	}
}