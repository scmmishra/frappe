// Copyright (c) 2016, Frappe Technologies and contributors
// For license information, please see license.txt
/* eslint-disable */

frappe.query_reports["Website Analytics"] = {
	"filters": [
			{
				"fieldname": "time_period",
				"label": __("Time Period"),
				"fieldtype": "Select",
				"options": "Past Week\nPast 2 Weeks\nPast Month\nPast 3 Months\nLifetime",
				"default": "Past 2 Weeks",
				"reqd": 1,
				"on_change": function() {
					let time_period = frappe.query_report.get_values().time_period;
					let field = frappe.query_report.get_filter('granularity')
					if (time_period = "Past Week") {
						field.df.options = "Daily";
					} else if (["Past 2 Weeks", "Past Month"].includes(time_period)) {
						field.df.options = "Daily\nWeekly";
					} else {
						field.df.options = "Daily\nWeekly\nMonthly";
					}
					field.refresh();
				}
			},
			{
				"fieldname": "granularity",
				"label": __("Granularity"),
				"fieldtype": "Select",
				"options": "Daily\nWeekly\nMonthly",
				"default": "Daily",
				"reqd": 1
			}
	],
};
