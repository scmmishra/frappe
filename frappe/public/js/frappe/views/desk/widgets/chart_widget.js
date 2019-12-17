import Widget from "./base_widget.js";

export default class ChartWidget extends Widget {
	constructor(opts) {
		super(opts);
		window.wid = this;
	}

	refresh() {
		//
	}

	customize() {
		this.setup_customize_actions();
	}

	make_chart() {
		this.body.empty()
		frappe.model.with_doc("Dashboard Chart", this.options.chart_name).then(chart_doc => {
			chart_doc.width = 'Full'
			let dashboard_chart = new frappe.ui.DashboardChart(chart_doc, this.body, { hide_title: true, hide_last_sync: true, hide_actions: true });
			dashboard_chart.show();
		});
	}

	set_body() {
		this.widget.addClass('dashboard-widget-box')
		// setTimeout(() => {
			this.make_chart();
		// }, 350);
	}

	setup_events() {
		//
	}

	setup_customize_actions() {
		this.action_area.empty()
		const buttons = $(`<button type="button" class="btn btn-xs btn-secondary btn-default selected">Resize</button>
					<button class="btn btn-secondary btn-light btn-danger btn-xs"><i class="fa fa-trash" aria-hidden="true"></i></button>`);
		buttons.appendTo(this.action_area);
	}

	set_actions() {
		this.action_area.empty()
		const buttons = $(`<div class="btn-group btn-group-xs" role="group" aria-label="Basic example">
						<button type="button" class="btn btn-secondary btn-default selected">Monthly</button>
						<button type="button" class="btn btn-secondary btn-default">Quaterly</button>
						<button type="button" class="btn btn-secondary btn-default">Yearly</button>
					</div>
					<button class="btn btn-secondary btn-light btn-default btn-xs"><i class="fa fa-refresh" aria-hidden="true"></i></button>`);
		buttons.appendTo(this.action_area);
	}
}