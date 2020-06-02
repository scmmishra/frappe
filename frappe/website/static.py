from __future__ import unicode_literals
import frappe
from werkzeug.wrappers import Response
from werkzeug.routing import NotFound
from werkzeug.wsgi import wrap_file
import os, mimetypes

def is_static_file(path):
	if ('.' not in path):
		return False
	extn = path.rsplit('.', 1)[-1]
	if extn in ('html', 'md', 'js', 'xml', 'css', 'txt', 'py'):
		return False

	for app in frappe.get_installed_apps():
		file_path = frappe.get_app_path(app, 'www') + '/' + path
		if os.path.exists(file_path):
			frappe.flags.file_path = file_path
			return True

	return False

def get_static_file_response():
	try:
		f = open(frappe.flags.file_path, 'rb')
	except IOError:
		raise NotFound

	response = Response(wrap_file(frappe.local.request.environ, f), direct_passthrough=True)
	response.mimetype = mimetypes.guess_type(frappe.flags.file_path)[0] or 'application/octet-stream'
	return response