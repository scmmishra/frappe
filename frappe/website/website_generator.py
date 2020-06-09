# Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
# MIT License. See license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document
from frappe.website.utils import cleanup_page_name
from frappe.website.render import clear_cache
from frappe.modules import get_module_name
from frappe.modules.full_text_search import build_index
from frappe.utils import strip_html_tags

class WebsiteGenerator(Document):
	website = frappe._dict()

	def __init__(self, *args, **kwargs):
		self.route = None
		super(WebsiteGenerator, self).__init__(*args, **kwargs)

	def get_website_properties(self, key=None, default=None):
		out = getattr(self, '_website', None) or getattr(self, 'website', None) or {}
		if not isinstance(out, dict):
			# website may be a property too, so ignore
			out = {}
		if key:
			return out.get(key, default)
		else:
			return out

	def autoname(self):
		if not self.name and self.meta.autoname != "hash":
			self.name = self.scrubbed_title()

	def onload(self):
		self.get("__onload").update({
			"is_website_generator": True,
			"published": self.is_website_published()
		})

	def validate(self):
		self.set_route()

	def set_route(self):
		if self.is_website_published() and not self.route:
			self.route = self.make_route()

		if self.route:
			self.route = self.route.strip('/.')[:139]

	def make_route(self):
		'''Returns the default route. If `route` is specified in DocType it will be
		route/title'''
		from_title = self.scrubbed_title()
		if self.meta.route:
			return self.meta.route + '/' + from_title
		else:
			return from_title

	def scrubbed_title(self):
		return self.scrub(self.get(self.get_title_field()))

	def get_title_field(self):
		'''return title field from website properties or meta.title_field'''
		title_field = self.get_website_properties('page_title_field')
		if not title_field:
			if self.meta.title_field:
				title_field = self.meta.title_field
			elif self.meta.has_field('title'):
				title_field = 'title'
			else:
				title_field = 'name'

		return title_field

	def clear_cache(self):
		super(WebsiteGenerator, self).clear_cache()
		clear_cache(self.route)

	def scrub(self, text):
		return cleanup_page_name(text).replace('_', '-')

	def get_parents(self, context):
		'''Return breadcrumbs'''
		pass

	def on_update(self):
		self.send_indexing_request()

	def on_trash(self):
		self.clear_cache()
		self.send_indexing_request('URL_DELETED')

	def is_website_published(self):
		"""Return true if published in website"""
		if self.get_condition_field():
			return self.get(self.get_condition_field()) and True or False
		else:
			return True

	def get_condition_field(self):
		condition_field = self.get_website_properties('condition_field')
		if not condition_field:
			if self.meta.is_published_field:
				condition_field = self.meta.is_published_field

		return condition_field

	def get_page_info(self):
		route = frappe._dict()
		route.update({
			"doc": self,
			"page_or_generator": "Generator",
			"ref_doctype":self.doctype,
			"idx": self.idx,
			"docname": self.name,
			"controller": get_module_name(self.doctype, self.meta.module),
		})

		route.update(self.get_website_properties())

		if not route.page_title:
			route.page_title = self.get(self.get_title_field())

		return route

	@staticmethod
	def build_doctype_index(doctype):
		documents = frappe.get_all(doctype, fields=['title', 'content', 'route as path'])
		for doc in documents:
			doc.doctype = doctype
			doc.content = strip_html_tags(doc.content)

		build_index("web_routes", documents)

	def send_indexing_request(self, operation_type='URL_UPDATED'):
		"""Send indexing request on update/trash operation."""

		if frappe.db.get_single_value('Website Settings', 'enable_google_indexing') \
			and self.is_website_published() and self.meta.allow_guest_to_view:

			url = frappe.utils.get_url(self.route)
			frappe.enqueue('frappe.website.doctype.website_settings.google_indexing.publish_site', \
				url=url, operation_type=operation_type)