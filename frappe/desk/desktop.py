import frappe
import json
from frappe.desk.moduleview import get_config

@frappe.whitelist()
def get_links_for_module(app, module):
	return [{'value': l.get('name'), 'label': l.get('label')} for l in get_links(app, module)]

def get_links(app, module):
	try:
		sections = get_config(app, frappe.scrub(module))
	except ImportError:
		return []

	links = []
	for section in sections:
		for item in section['items']:
			links.append(item)
	return links

@frappe.whitelist()
def get_desktop_settings():
	from frappe.config import get_modules_from_all_apps_for_user

	# Setup default list of modules
	modules_list = get_modules_from_all_apps_for_user()
	modules_dict = {mod.get('module_name'): mod for mod in modules_list}

	module_categories = ['Modules', 'Domains', 'Places', 'Administration']
	desktop_configuration = {}

	# Fetch User Customization
	home_settings = get_home_settings()

	# Stores visibility and order of modules
	user_saved_modules_by_category = home_settings.modules_by_category or {}

	# links for each module
	user_saved_links_by_module = home_settings.links_by_module or {}

	def add_links(module):
		module = frappe._dict(module)
		all_links = get_links(module.app, module.module_name)
		module_links_by_name = {}
		for link in all_links:
			module_links_by_name[link['name']] = link

		if module.module_name in user_saved_links_by_module:
			user_links = frappe.parse_json(user_saved_links_by_module[module.module_name])
			module.links = [module_links_by_name[l] for l in user_links if l in module_links_by_name]

		return module

	for category in module_categories:
		# If user has customized the category items
		if category in user_saved_modules_by_category:
			user_modules = user_saved_modules_by_category[category]
			desktop_configuration[category] = [add_links(modules_dict[m]) for m in user_modules if modules_dict.get(m)]
		else:
			desktop_configuration[category] = [add_links(m) for m in modules_list if m.get('category') == category]

	# filter out hidden modules
	if home_settings.hidden_modules:
		for category in desktop_configuration:
			hidden_modules = home_settings.hidden_modules or []
			modules = desktop_configuration[category]
			desktop_configuration[category] = [module for module in modules if module.module_name not in hidden_modules]

	return desktop_configuration

@frappe.whitelist()
def update_hidden_modules(category_map):
	category_map = frappe.parse_json(category_map)
	home_settings = get_home_settings()

	saved_hidden_modules = home_settings.hidden_modules or []

	for category in category_map:
		config = frappe._dict(category_map[category])
		saved_hidden_modules += config.removed or []
		saved_hidden_modules = [d for d in saved_hidden_modules if d not in (config.added or [])]

		if home_settings.get('modules_by_category') and home_settings.modules_by_category.get(category):
			module_placement = [d for d in (config.added or []) if d not in home_settings.modules_by_category[category]]
			home_settings.modules_by_category[category] += module_placement

	home_settings.hidden_modules = saved_hidden_modules
	set_home_settings(home_settings)

	return get_desktop_settings()

@frappe.whitelist()
def update_global_hidden_modules(modules):
	modules = frappe.parse_json(modules)
	frappe.only_for('System Manager')

	doc = frappe.get_doc('User', 'Administrator')
	doc.set('block_modules', [])
	for module in modules:
		doc.append('block_modules', {
			'module': module
		})

	doc.save(ignore_permissions=True)

	return get_desktop_settings()


@frappe.whitelist()
def update_modules_order(module_category, modules):
	modules = frappe.parse_json(modules)
	home_settings = get_home_settings()

	home_settings.modules_by_category = home_settings.modules_by_category or {}
	home_settings.modules_by_category[module_category] = modules

	set_home_settings(home_settings)

@frappe.whitelist()
def update_links_for_module(app, module_name, links):
	links = frappe.parse_json(links)
	home_settings = get_home_settings()

	home_settings.setdefault('links_by_module', {})
	home_settings['links_by_module'].setdefault(module_name, None)
	home_settings['links_by_module'][module_name] = links

	set_home_settings(home_settings)

	all_links = get_links(app, module_name)

	return [data for data in all_links if data.get('name', '') in links]

@frappe.whitelist()
def get_options_for_show_hide_cards():
	global_options = []

	if 'System Manager' in frappe.get_roles():
		global_options = get_options_for_global_modules()

	return {
		'user_options': get_options_for_user_blocked_modules(),
		'global_options': global_options
	}

@frappe.whitelist()
def get_options_for_global_modules():
	from frappe.config import get_modules_from_all_apps
	all_modules = get_modules_from_all_apps()

	blocked_modules = frappe.get_doc('User', 'Administrator').get_blocked_modules()

	options = []
	for module in all_modules:
		module = frappe._dict(module)
		options.append({
			'category': module.category,
			'label': module.label,
			'value': module.module_name,
			'checked': module.module_name not in blocked_modules
		})

	return options

@frappe.whitelist()
def get_options_for_user_blocked_modules():
	from frappe.config import get_modules_from_all_apps_for_user
	all_modules = get_modules_from_all_apps_for_user()
	home_settings = get_home_settings()

	hidden_modules = home_settings.hidden_modules or []

	options = []
	for module in all_modules:
		module = frappe._dict(module)
		options.append({
			'category': module.category,
			'label': module.label,
			'value': module.module_name,
			'checked': module.module_name not in hidden_modules
		})

	return options

def set_home_settings(home_settings):
	frappe.cache().hset('home_settings', frappe.session.user, home_settings)
	frappe.db.set_value('User', frappe.session.user, 'home_settings', json.dumps(home_settings))

@frappe.whitelist()
def get_home_settings():
	def get_from_db():
		settings = frappe.db.get_value("User", frappe.session.user, 'home_settings')
		return frappe.parse_json(settings or '{}')

	home_settings = frappe.cache().hget('home_settings', frappe.session.user, get_from_db)
	return home_settings


def get_module_link_items_from_list(app, module, list_of_link_names):
	try:
		sections = get_config(app, frappe.scrub(module))
	except ImportError:
		return []

	links = []
	for section in sections:
		for item in section["items"]:
			if item.get("label", "") in list_of_link_names:
				links.append(item)

	return links


def set_last_modified(data):
	for section in data:
		for item in section["items"]:
			if item["type"] == "doctype":
				item["last_modified"] = get_last_modified(item["name"])

def get_last_modified(doctype):
	def _get():
		try:
			last_modified = frappe.get_all(doctype, fields=["max(modified)"], as_list=True, limit_page_length=1)[0][0]
		except Exception as e:
			if frappe.db.is_table_missing(e):
				last_modified = None
			else:
				raise

		# hack: save as -1 so that it is cached
		if last_modified==None:
			last_modified = -1

		return last_modified

	last_modified = frappe.cache().hget("last_modified", doctype, _get)

	if last_modified==-1:
		last_modified = None

	return last_modified
