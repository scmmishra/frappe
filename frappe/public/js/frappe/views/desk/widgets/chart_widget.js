import Widget from "./base_widget.js";

export default class ChartWidget extends Widget {
	constructor(opts) {
		super(opts);
		window.wid = this;
	}

	refresh() {
		//
	}

	set_title() {

	}

	make_chart() {
		frappe.model.with_doc("Dashboard Chart", this.data.chart_name).then(chart_doc => {
			chart_doc.width = 'full'
			let dashboard_chart = new frappe.ui.DashboardChart(chart_doc, this.body);
			dashboard_chart.show();
		});
	}

	set_body() {
		// this.widget.css('grid-area', '1 / 1 / 1 / 3')
		setTimeout(() => {
			this.make_chart();
		}, 350);
	}

	setup_events() {
		//
	}
}