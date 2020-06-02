# Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
# MIT License. See license.txt

from __future__ import unicode_literals
import frappe
from frappe import _
import frappe.sessions
from frappe.utils import cstr
import os, mimetypes, json
import functools
import re

import six
from bs4 import BeautifulSoup
from six import iteritems
from werkzeug.wrappers import Response
from werkzeug.routing import Map, Rule, NotFound
from werkzeug.wsgi import wrap_file

from frappe.website.context import get_context
from frappe.website.redirect import resolve_redirect
from frappe.website.utils import (get_home_page, can_cache, delete_page_cache,
	get_toc, get_next_link)
from frappe.website.static import is_static_file, get_static_file_response
from frappe.website.router import clear_sitemap
from frappe.translate import guess_language

"""
Website Router

The request reaches router from app.py

	response = frappe.website.render.render()

Once render is initialized, we first need to cleanup the route,
resolve it against any doctype map, check for static file and redirects.

Next step is resoling the route, this piece of the code checks
wether the route requested is of a standard type, they can be
one of the following:

	1. Static Page
	1. Web Form
	1. DocType View
		1. List
		1. Item
	1. Print View

The precedence is as sequenced in the list above.
"""

class PageNotFoundError(Exception): pass
class RouteResolved(Exception): pass

class RenderEngine:
	def __init__(self, path=None, http_status_code=None):
		# Reset
		self.data = None
		self.http_status_code = http_status_code

		# Set base path based on params or locals
		self.path = path or frappe.local.request.path or get_home_page()
		# Remove leading and trailing slashes, remove .html
		self.path = self.path.strip('/ ').rstrip(".html")
		# resovlve path from website route map
		self.path = resolve_from_map(self.path)

		# Check if route caching is enabled
		self.can_cache = can_cache and can_cache()

	def resolve(self):
		if is_static_file(self.path):
			return get_static_file_response()

		try:
			self.disabled()
			self.redirect()
			self.four_oh_four()
			self.web_form()
			self.page()
			self.printview()
			self.listview()

		except RouteResolved:
			pass

		except frappe.PermissionError as e:
			self.data, self.http_status_code = render_403(e, self.path)

		except frappe.Redirect:
			return build_response(self.path, "", 301, {
				"Location": frappe.flags.redirect_location or (frappe.local.response or {}).get('location'),
				"Cache-Control": "no-store, no-cache, must-revalidate"
			})

		except Exception:
			self.path = "error"
			self.data = render_page(self.path)
			self.http_status_code = 500

		return build_response(self.path, self.data, self.http_status_code or 200)

	def disabled(self):
		routes = frappe.db.get_all('Portal Menu Item',
			fields=['route', 'enabled'],
			filters={
				'enabled': 0,
				'route': ['like', '%{0}'.format(self.path)]
			}
		)

		for r in routes:
			_path = r.route.lstrip('/')
			if self.path == _path and not r.enabled:
				raise frappe.PermissionError

	def redirect(self):
		resolve_redirect(self.path)

	def four_oh_four(self):
		if self.can_cache and frappe.cache().hget('website_404', frappe.request.url):
			self.data = render_page('404')
			self.http_status_code = 404
			raise RouteResolved

	def web_form(self):
		if bool(frappe.get_all("Web Form", filters={'route': self.path})):
			self.data = render_web_form(self.path)
			raise RouteResolved

	def page(self):
		try:
			self.data = render_page_by_language(self.path)
			raise RouteResolved
		except frappe.DoesNotExistError:
			return

	def printview(self):
		doctype, name = self.path_doctype_and_name()
		if doctype and name:
			self.path = "printview"
			frappe.local.form_dict.doctype = doctype
			frappe.local.form_dict.name = name

			self.data = render_page(self.path)
			raise RouteResolved

	def listview(self):
		doctype, name = self.path_doctype_and_name()
		if doctype:
			self.path = "list"
			frappe.local.form_dict.doctype = doctype

			self.data = render_page(self.path)
			raise RouteResolved

	def path_doctype_and_name(self):
		doctypes = frappe.db.sql_list("select name from tabDocType")
		parts = self.path.split("/")

		doctype = parts[0]
		name = parts[1] if len(parts) > 1 else None
		if doctype in doctypes:
			return doctype, name

		# try scrubbed
		doctype = doctype.replace("_", " ").title()
		if doctype in doctypes:
			return doctype, name

		return None, None

def render(path=None, http_status_code=None):
	"""render html page"""
	engine = RenderEngine(path=path, http_status_code=http_status_code)
	return engine.resolve()

def build_response(path, data, http_status_code, headers=None):
	# build response
	response = Response()
	response.data = set_content_type(response, data, path)
	response.status_code = http_status_code
	response.headers["X-Page-Name"] = path.encode("ascii", errors="xmlcharrefreplace")
	response.headers["X-From-Cache"] = frappe.local.response.from_cache or False

	add_preload_headers(response)
	if headers:
		for key, val in iteritems(headers):
			response.headers[key] = val.encode("ascii", errors="xmlcharrefreplace")

	return response


def add_preload_headers(response):
	try:
		preload = []
		soup = BeautifulSoup(response.data, "lxml")
		for elem in soup.find_all('script', src=re.compile(".*")):
			preload.append(("script", elem.get("src")))

		for elem in soup.find_all('link', rel="stylesheet"):
			preload.append(("style", elem.get("href")))

		links = []
		for type, link in preload:
			links.append("</{}>; rel=preload; as={}".format(link.lstrip("/"), type))

		if links:
			response.headers["Link"] = ",".join(links)
	except Exception:
		import traceback
		traceback.print_exc()


def render_page_by_language(path):
	translated_languages = frappe.get_hooks("translated_languages_for_website")
	user_lang = guess_language(translated_languages)
	if translated_languages and user_lang in translated_languages:
		try:
			if path and path != "index":
				lang_path = '{0}/{1}'.format(user_lang, path)
			else:
				lang_path = user_lang # index

			return render_page(lang_path)
		except frappe.DoesNotExistError:
			return render_page(path)

	else:
		return render_page(path)

def render_page(path):
	"""get page html"""
	out = None

	if can_cache():
		# return rendered page
		page_cache = frappe.cache().hget("website_page", path)
		if page_cache and frappe.local.lang in page_cache:
			out = page_cache[frappe.local.lang]

	if out:
		frappe.local.response.from_cache = True
		return out

	return build(path)

def build(path):
	if not frappe.db:
		frappe.connect()

	try:
		return build_page(path)
	except frappe.DoesNotExistError:
		hooks = frappe.get_hooks()
		if hooks.website_catch_all:
			path = hooks.website_catch_all[0]
			return build_page(path)
		else:
			raise
	except Exception:
		raise

def build_page(path):
	if not getattr(frappe.local, "path", None):
		frappe.local.path = path

	context = get_context(path)

	if context.template:
		if path.endswith('min.js'):
			html = frappe.get_jloader().get_source(frappe.get_jenv(), context.template)[0]
		else:
			html = frappe.get_template(context.template).render(context)
	elif context.source:
		html = frappe.render_template(context.source, context)

	if '{index}' in html:
		html = html.replace('{index}', get_toc(context.route))

	if '{next}' in html:
		html = html.replace('{next}', get_next_link(context.route))

	# html = frappe.get_template(context.base_template_path).render(context)

	if can_cache(context.no_cache):
		page_cache = frappe.cache().hget("website_page", path) or {}
		page_cache[frappe.local.lang] = html
		frappe.cache().hset("website_page", path, page_cache)

	return html

def resolve_path(path):
	if not path:
		path = "index"

	if path.endswith('.html'):
		path = path[:-5]

	if path == "index":
		path = get_home_page()

	frappe.local.path = path

	if path != "index":
		path = resolve_from_map(path)

	return path

def resolve_from_map(path):
	m = Map([Rule(r["from_route"], endpoint=r["to_route"], defaults=r.get("defaults"))
		for r in get_website_rules()])

	if frappe.local.request:
		urls = m.bind_to_environ(frappe.local.request.environ)
	try:
		endpoint, args = urls.match("/" + path)
		path = endpoint
		if args:
			# don't cache when there's a query string!
			frappe.local.no_cache = 1
			frappe.local.form_dict.update(args)

	except NotFound:
		pass

	return path

def get_website_rules():
	'''Get website route rules from hooks and DocType route'''
	def _get():
		rules = frappe.get_hooks("website_route_rules")
		for d in frappe.get_all('DocType', 'name, route', dict(has_web_view=1)):
			if d.route:
				rules.append(dict(from_route = '/' + d.route.strip('/'), to_route=d.name))

		return rules

	return frappe.cache().get_value('website_route_rules', _get)

def set_content_type(response, data, path):
	if isinstance(data, dict):
		response.mimetype = 'application/json'
		response.charset = 'utf-8'
		data = json.dumps(data)
		return data

	response.mimetype = 'text/html'
	response.charset = 'utf-8'

	if "." in path:
		content_type, encoding = mimetypes.guess_type(path)
		if content_type:
			response.mimetype = content_type
			if encoding:
				response.charset = encoding

	return data

def clear_cache(path=None):
	'''Clear website caches

	:param path: (optional) for the given path'''
	for key in ('website_generator_routes', 'website_pages',
		'website_full_index'):
		frappe.cache().delete_value(key)

	frappe.cache().delete_value("website_404")
	if path:
		frappe.cache().hdel('website_redirects', path)
		delete_page_cache(path)
	else:
		clear_sitemap()
		frappe.clear_cache("Guest")
		for key in ('portal_menu_items', 'home_page', 'website_route_rules',
			'doctypes_with_web_view', 'website_redirects', 'page_context',
			'website_page'):
			frappe.cache().delete_value(key)

	for method in frappe.get_hooks("website_clear_cache"):
		frappe.get_attr(method)(path)

def render_403(e, pathname):
	frappe.local.message = cstr(e.message if six.PY2 else e)
	frappe.local.message_title = _("Not Permitted")
	frappe.local.response['context'] = dict(
		indicator_color = 'red',
		primary_action = '/login',
		primary_label = _('Login'),
		fullpage=True
	)

def add_csrf_token(data):
	if frappe.local.session:
		return data.replace("<!-- csrf_token -->", '<script>frappe.csrf_token = "{0}";</script>'.format(
				frappe.local.session.data.csrf_token))
	else:
		return data
