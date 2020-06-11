# -*- coding: utf-8 -*-
# Copyright (c) 2019, Frappe Technologies and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
import re
from frappe.website.website_generator import WebsiteGenerator

class WebFormBeta(WebsiteGenerator):
	website = frappe._dict(
		no_cache = 1
	)

	def validate(self: 'WebFormBeta') -> None:
		self.route = self.make_route()

	def make_route(self: 'WebFormBeta') -> str:
		"""Generate or prefix route

		Returns:
			str: route with 'form/' prefix
		"""	
		prefix = "form/"
		if not self.route:
			# If not route is present, scrub the title
			self.route = prefix + self.scrub(self.title)
		else:
			# remove trailing and leading slashes from route
			self.route = self.route.strip('/')
			
		if not self.route.startswith('form/'):
			# If route does not start with form, add it
			# strip leading / from route
			self.route = prefix + self.route.lstrip('/')

		# replace multiple slashes with single
		return re.sub(r'[/]+', '/', self.route)
	
	@staticmethod
	def fetch_fields(reference_doctype: str, mandatory_only: bool=False) -> list:
		"""Fetch fields from reference doctype to add to fieldslist

		Args:
			reference_doctype (str): DocType to fetch fields from
			mandatory_only (bool, optional): Return all fields or mandatory only. Defaults to False.

		Returns:
			list[WebFormBetaField]: List of fields from reference doctype meta
		"""
		def mandatory(field):
			return field.reqd
		fields = frappe.get_meta(reference_doctype).fields
		if mandatory_only:
			return list(filter(mandatory, fields))
		return fields