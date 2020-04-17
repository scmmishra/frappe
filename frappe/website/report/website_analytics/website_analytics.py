# Copyright (c) 2013, Frappe Technologies and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
from collections import defaultdict
from datetime import datetime

import frappe
from frappe import _

def execute(filters=None):
	columns = [{
		'fieldname': "path",
		'label': _('Path'),
		'fieldtype': 'Data',
		'width': 300
	}, {
		'fieldname': 'count',
		'label': _('Count'),
		'fieldtype': 'Int',
		'width': 150
	}, {
		'fieldname': 'unique_count',
		'label': _('Unique Visitors'),
		'fieldtype': 'Int',
		'width': 150
	}]

	where_conditions = prepare_filters(filters.time_period)


	data = frappe.db.sql("""
			SELECT `path`,
				count(*) as count,
				count(CASE WHEN is_unique = 1 THEN 1 END) as unique_count
			FROM `tabWeb Page View`
			{0}
			GROUP BY path
			ORDER BY count DESC;
		""".format(where_conditions), as_dict=1)

	return columns, data, None, None, None

def get_chart_data(filters=None):
	where_conditions = prepare_filters(filters.time_period)
	field, date_format = get_field_for_chart(filters.granularity)

	data = frappe.db.sql("""
			SELECT
				DATE_FORMAT({0}, '{1}') as date,
				COUNT(*) as count,
				count(CASE WHEN is_unique = 1 THEN 1 END) as unique_count
			FROM `tabWeb Page View`
			{2}
			GROUP BY DATE_FORMAT({0}, '{1}')
			ORDER BY creation
		""".format(field, date_format, where_conditions), as_dict=1)

	from pprint import pprint

def get_field_for_chart(granularity):
	field = 'creation'
	date_format = '%Y-%m-%d'

	if granularity == "Weekly":
		field = 'ADDDATE(creation, INTERVAL 1-DAYOFWEEK(creation) DAY)'

	elif granularity == "Monthly":
		date_format = '%Y-%m-01'

	return field, date_format


def prepare_filters(time_period):
	created = get_last_created(time_period)
	if created:
		return " WHERE `tabWeb Page View`.creation >= '{0}' ".format(str(created))
	else:
		return ''

def get_last_created(time_period):
	today = frappe.utils.nowdate()

	if time_period == "Lifetime":
		return None

	elif time_period == "Past Week":
		return frappe.utils.add_days(today, -7)

	elif time_period == "Past 2 Weeks":
		return frappe.utils.add_days(today, -2)

	elif time_period == "Past Month":
		return frappe.utils.add_months(today, -1)

	elif time_period == "Past 3 Months":
		return frappe.utils.add_months(today, -3)
