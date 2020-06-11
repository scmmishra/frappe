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

	def validate(self):
		self.route = self.make_route()

	def make_route(self):
		"""Generate or prefix route

		Returns:
			string: route with 'form/' prefix
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


def get_fields():
	pass
