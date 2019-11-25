// Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
// MIT License. See license.txt
import ListFilter from './list_filter';
import ListSidebarDropdown from './list_sidebar_dropdown';
frappe.provide('frappe.views');

// opts:
// stats = list of fields
// doctype
// parent
// set_filter = function called on click

frappe.views.ListSidebar = class ListSidebar {
	constructor(opts) {
		$.extend(this, opts);
		this.make();
		this.cat_tags = [];
	}

	make() {
		var sidebar_content = frappe.render_template("list_sidebar", { doctype: this.doctype });

		this.sidebar = $('<div class="list-sidebar overlay-sidebar hidden-xs hidden-sm"></div>')
			.html(sidebar_content)
			.appendTo(this.page.sidebar.empty());

		this.setup_reports();
		this.setup_list_filter();
		this.setup_views();
		this.setup_kanban_boards();
		this.setup_another_calendar();
		this.setup_email_inbox();
		this.setup_keyboard_shortcuts();
		this.setup_list_group_by();

		// do not remove
		// used to trigger custom scripts
		$(document).trigger('list_sidebar_setup');

		if (this.list_view.list_view_settings && this.list_view.list_view_settings.disable_sidebar_stats) {
			this.sidebar.find('.sidebar-stat').remove();
		} else {
			this.sidebar.find('.list-stats').on('click', (e) => {
				$(e.currentTarget).find('.stat-link').remove();
				this.get_stats();
			});
		}

	}

	setup_views() {
		var show_list_link = false;

		if (frappe.views.calendar[this.doctype]) {
			this.sidebar.find('.list-link[data-view="Calendar"]').removeClass("hide");
			this.sidebar.find('.list-link[data-view="Gantt"]').removeClass('hide');
			show_list_link = true;
		}
		//show link for kanban view
		this.sidebar.find('.list-link[data-view="Kanban"]').removeClass('hide');
		if (this.doctype === "Communication" && frappe.boot.email_accounts.length) {
			this.sidebar.find('.list-link[data-view="Inbox"]').removeClass('hide');
			show_list_link = true;
		}

		if (frappe.treeview_settings[this.doctype] || frappe.get_meta(this.doctype).is_tree) {
			this.sidebar.find(".tree-link").removeClass("hide");
		}

		this.current_view = 'List';
		var route = frappe.get_route();
		if (route.length > 2 && frappe.views.view_modes.includes(route[2])) {
			this.current_view = route[2];

			if (this.current_view === 'Kanban') {
				this.kanban_board = route[3];
			} else if (this.current_view === 'Inbox') {
				this.email_account = route[3];
			}
		}

		// disable link for current view
		this.sidebar.find('.list-link[data-view="' + this.current_view + '"] a')
			.attr('disabled', 'disabled').addClass('disabled');

		//enable link for Kanban view
		this.sidebar.find('.list-link[data-view="Kanban"] a, .list-link[data-view="Inbox"] a')
			.attr('disabled', null).removeClass('disabled');

		// show image link if image_view
		if (this.list_view.meta.image_field) {
			this.sidebar.find('.list-link[data-view="Image"]').removeClass('hide');
			show_list_link = true;
		}

		if (show_list_link) {
			this.sidebar.find('.list-link[data-view="List"]').removeClass('hide');
		}
	}

	setup_reports() {
		// add reports linked to this doctype to the dropdown
		var me = this;
		var added = [];
		var dropdown = this.page.sidebar.find('.reports-dropdown');
		var divider = false;

		var add_reports = function(reports) {
			$.each(reports, function(name, r) {
				if (!r.ref_doctype || r.ref_doctype == me.doctype) {
					var report_type = r.report_type === 'Report Builder' ?
						`List/${r.ref_doctype}/Report` : 'query-report';

					var route = r.route || report_type + '/' + (r.title || r.name);

					if (added.indexOf(route) === -1) {
						// don't repeat
						added.push(route);

						if (!divider) {
							me.get_divider().appendTo(dropdown);
							divider = true;
						}

						$('<li><a href="#' + route + '">' +
							__(r.title || r.name) + '</a></li>').appendTo(dropdown);
					}
				}
			});
		};

		// from reference doctype
		if (this.list_view.settings.reports) {
			add_reports(this.list_view.settings.reports);
		}

		// Sort reports alphabetically
		var reports = Object.values(frappe.boot.user.all_reports).sort((a,b) => a.title.localeCompare(b.title)) || [];

		// from specially tagged reports
		add_reports(reports);
	}

	setup_list_filter() {
		this.list_filter = new ListFilter({
			wrapper: this.page.sidebar.find('.list-filters'),
			doctype: this.doctype,
			list_view: this.list_view
		});
	}

	setup_kanban_boards() {
		const $dropdown = this.page.sidebar.find('.kanban-dropdown');
		frappe.views.KanbanView.setup_dropdown_in_sidebar(this.doctype, $dropdown);
	}

	setup_calendar_view() {
		const doctype = this.doctype;

		function get_calendar_url(name=null) {
			if (name) {
				return `<li><a href="#List/${doctype}/Calendar/${name}" style="white-space:nowrap;overflow:hidden;text-overflow: ellipsis;">${ __(name) }</a></li>`
			}

			// Return default if no name provided
			return `<li><a href="#List/${doctype}/Calendar/Default">${ __("Default") }</a></li>`
		}

		frappe.db.get_list('Calendar View', {
			filters: {
				reference_doctype: doctype
			}
		}).then(result => {
			if (!result) return;
			const calendar_views = result;
			const $link_calendar = this.sidebar.find('.list-link[data-view="Calendar"]');

			let default_link = '';
			if (frappe.views.calendar[this.doctype]) {
				// has standard calendar view
				default_link = get_calendar_url();
			}
			let dropdown_body = ''
			if (calendar_views.length) {
				dropdown_body = calendar_views.map(view => {
					return get_calendar_url(view.name)
				}).join('');
			} else if(!default_link) {
				dropdown_body = `<li class="text-muted p-2 text-center" style="padding: 1em !important;text-align: center;">
						${__('No Calendar View Found')}
					</li>`
			}

			const dropdown_html = `
				<div class="btn-group">
					<a class="dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
						${ __("Calendar") } <span class="caret"></span>
					</a>
					<ul class="dropdown-menu calendar-dropdown" style="max-height: 300px; overflow-y: auto;">
						${default_link}
						${dropdown_body}
					</ul>
				</div>
			`;
			$link_calendar.removeClass('hide');
			$link_calendar.html(dropdown_html);
		});
	}

	setup_calendar_view() {
		const doctype = this.doctype;

		frappe.db.get_list('Calendar View', {
			filters: {
				reference_doctype: doctype
			}
		}).then(result => {
			let calendar_views = []
			if (frappe.views.calendar[this.doctype]) {
				// has standard calendar view
				calendar_views = [{ name: __('Default') }, ...result]
			} else {
				calendar_views = result;
			}
			const $link_calendar = this.sidebar.find('.list-link[data-view="Calendar"]');

			const formatter = function(doctype, item) {
				return `<li>
						<a href="#List/${doctype}/Calendar/${item.name}" style="white-space:nowrap;overflow:hidden;text-overflow: ellipsis;">
							${item.name}
						</a>
					</li>`
			}

			const calendar_dropdown = new ListSidebarDropdown({
				label: __("Calendar"),
				list_items: calendar_views,
				wrapper: $link_calendar,
				doctype: this.doctype,
				formatter: (doctype, item) => formatter(doctype, item),
				empty_message: __("No Calendar View Found"),
				allow_search: true,
				allow_creation: true
			})
			$link_calendar.removeClass('hide');
		});
	}

	setup_email_inbox() {
		// get active email account for the user and add in dropdown
		if (this.doctype != "Communication")
			return;

		let $dropdown = this.page.sidebar.find('.email-account-dropdown');
		let divider = false;

		if (has_common(frappe.user_roles, ["System Manager", "Administrator"])) {
			$(`<li class="new-email-account"><a>${__("New Email Account")}</a></li>`)
				.appendTo($dropdown);
		}

		let accounts = frappe.boot.email_accounts;
		accounts.forEach((account) => {
			let email_account = (account.email_id == "All Accounts") ? "All Accounts" : account.email_account;
			let route = ["List", "Communication", "Inbox", email_account].join('/');
			if (!divider) {
				this.get_divider().appendTo($dropdown);
				divider = true;
			}
			$(`<li><a href="#${route}">${account.email_id}</a></li>`).appendTo($dropdown);
			if (account.email_id === "Sent Mail")
				divider = false;
		});

		$dropdown.find('.new-email-account').click(function() {
			frappe.new_doc("Email Account");
		});
	}

	setup_keyboard_shortcuts() {
		this.sidebar.find('.list-link > a, .list-link > .btn-group > a').each((i, el) => {
			frappe.ui.keys
				.get_shortcut_group(this.page)
				.add($(el));
		});
	}

	setup_list_group_by() {
		this.list_group_by = new frappe.views.ListGroupBy({
			doctype: this.doctype,
			sidebar: this,
			list_view: this.list_view,
			page: this.page
		});
	}

	setup_dropdown_search(dropdown, text_class) {
		let $dropdown_search = dropdown.find('.dropdown-search').show();
		let $search_input = $dropdown_search.find('.dropdown-search-input');
		$search_input.focus();
		$dropdown_search.on('click',(e)=>{
			e.stopPropagation();
		});
		let $elements = dropdown.find('li');
		$dropdown_search.on('keyup',()=> {
			let text_filter = $search_input.val().toLowerCase();
			// Replace trailing and leading spaces
			text_filter = text_filter.replace(/^\s+|\s+$/g, '');
			let text;
			for (var i = 0; i < $elements.length; i++) {
				let text_element = $elements.eq(i).find(text_class);

				let text = text_element.text().toLowerCase();
				// Search data-name since label for current user is 'Me'
				let name = text_element.data('name').toLowerCase();
				if (text.includes(text_filter) || name.includes(text_filter)) {
					$elements.eq(i).css('display','');
				} else {
					$elements.eq(i).css('display','none');
				}
			}
		});
		dropdown.parent().on('hide.bs.dropdown',()=> {
			$dropdown_search.val('');
		});
	}


	get_cat_tags() {
		return this.cat_tags;
	}

	get_stats() {
		var me = this;
		frappe.call({
			method: 'frappe.desk.reportview.get_sidebar_stats',
			type: 'GET',
			args: {
				stats: me.stats,
				doctype: me.doctype,
				filters: me.default_filters || []
			},
			callback: function(r) {
				me.render_stat("_user_tags", (r.message.stats || {})["_user_tags"]);
				let stats_dropdown = me.sidebar.find('.list-stats-dropdown');
				me.setup_dropdown_search(stats_dropdown,'.stat-label');
			}
		});
	}

	render_stat(field, stat, tags) {
		console.trace()
		var me = this;
		var sum = 0;
		var stats = [];
		var label = frappe.meta.docfield_map[this.doctype][field] ?
			frappe.meta.docfield_map[this.doctype][field].label : field;

		stat = (stat || []).sort(function(a, b) {
			return b[1] - a[1];
		});
		$.each(stat, function(i, v) {
			sum = sum + v[1];
		});

		if (tags) {
			for (var t in tags) {
				var nfound = -1;
				for (var i in stat) {
					if (tags[t] === stat[i][0]) {
						stats.push(stat[i]);
						nfound = i;
						break;
					}
				}
				if (nfound < 0) {
					stats.push([tags[t], 0]);
				} else {
					me.tempstats["_user_tags"].splice(nfound, 1);
				}
			}
			field = "_user_tags";
		} else {
			stats = stat;
		}
		var context = {
			field: field,
			stat: stats,
			sum: sum,
			label: field === '_user_tags' ? (tags ? __(label) : __("Tag")) : __(label),
		};
		$(frappe.render_template("list_sidebar_stat", context))
			.on("click", ".stat-link", function() {
				var doctype = "Tag Link";
				var fieldname = $(this).attr('data-field');
				var label = $(this).attr('data-label');
				var condition = "=";
				var existing = me.list_view.filter_area.filter_list.get_filter(fieldname);
				if(existing) {
					existing.remove();
				}
				if (label == "No Tags") {
					label = "%,%";
					condition = "not like";
				}
				me.list_view.filter_area.filter_list.add_filter(doctype, fieldname, condition, label)
					.then(function() {
						me.list_view.refresh();
					});
			})
			.appendTo(this.sidebar.find(".list-stats-dropdown"));
	}

	set_fieldtype(df) {

		// scrub
		if (df.fieldname == "docstatus") {
			df.fieldtype = "Select",
			df.options = [
				{ value: 0, label: "Draft" },
				{ value: 1, label: "Submitted" },
				{ value: 2, label: "Cancelled" },
			];
		} else if (df.fieldtype == 'Check') {
			df.fieldtype = 'Select';
			df.options = [{ value: 0, label: 'No' },
				{ value: 1, label: 'Yes' }
			];
		} else if (['Text', 'Small Text', 'Text Editor', 'Code', 'Tag', 'Comments',
			'Dynamic Link', 'Read Only', 'Assign'
		].indexOf(df.fieldtype) != -1) {
			df.fieldtype = 'Data';
		} else if (df.fieldtype == 'Link' && this.$w.find('.condition').val() != "=") {
			df.fieldtype = 'Data';
		}
		if (df.fieldtype === "Data" && (df.options || "").toLowerCase() === "email") {
			df.options = null;
		}
	}

	reload_stats() {
		this.sidebar.find(".sidebar-stat").remove();
		this.get_stats();
	}

	get_divider() {
		return $('<li role="separator" class="divider"></li>');
	}
};
