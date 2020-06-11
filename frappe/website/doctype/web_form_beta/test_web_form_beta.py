# -*- coding: utf-8 -*-
# Copyright (c) 2019, Frappe Technologies and Contributors
# See license.txt
from __future__ import unicode_literals
import frappe
import unittest

NOTE_FIELDS = set(['title', 'public', 'notify_on_login', 'notify_on_every_login',
	'expire_notification_on', 'content', 'seen_by_section', 'seen_by'])

MANDATORY_FIELDS = set(["title"])

class TestWebFormBeta(unittest.TestCase):
	def setUp(self):
		frappe.conf.disable_website_cache = True
		frappe.local.path = None

	def tearDown(self):
		frappe.conf.disable_website_cache = False
		frappe.local.path = None
	
	def test_make_route(self):
		test_doc = get_test_doc()
		# Test no route
		self.assertEqual(test_doc.make_route(), "form/-test-web-form-beta")
		
		# Test dirty routes
		test_routes = ["//hello", "form/hello", "/form///hello//", "form/hello//"]
		for route in test_routes:
			test_doc.route = route
			self.assertEqual(test_doc.make_route(), "form/hello")
	
	def test_fetch_fields(self):
		test_doc = frappe.new_doc("Web Form Beta")
		# Test all fields
		fields = set([field.fieldname for field in test_doc.fetch_fields("Note")])
		self.assertTrue(fields == NOTE_FIELDS)
		
		# Test mandatory fields
		fields = set([field.fieldname for field in test_doc.fetch_fields("Note", True)])
		self.assertTrue(fields == MANDATORY_FIELDS)

def get_test_doc():
	doc = frappe.new_doc("Web Form Beta")
	doc.title = "_Test Web Form Beta"
	return doc