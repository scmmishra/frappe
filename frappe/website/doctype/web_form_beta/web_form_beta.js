// Copyright (c) 2019, Frappe Technologies and contributors
// For license information, please see license.txt

frappe.web_form = {
	set_fields_table: function(frm, mandatory = false) {
		let ref_doc = frm.doc.reference_doctype;

		// Throw an error if refernce doctype is not set
		if (!ref_doc) {
			frappe.throw({
				message: "Please select a Reference Doctype",
				title: "Mandatory Error",
			});
		}

		frm.call("fetch_fields", {
			reference_doctype: ref_doc,
			mandatory_only: mandatory,
		}).then((res) => {
			const fields = res.message;
			fields.forEach((field) => {
				frm.add_child("fields", field);
			});
			frm.refresh();
		});
	},

	set_fieldname_select: function(frm) {
		let ref_doc = frm.doc.reference_doctype;
		if (!ref_doc) {
			return;
		}

		frm.call("fetch_fields", {
			reference_doctype: ref_doc,
		}).then((res) => {
			const fields = res.message;
			let options = fields.map((df) => {
				return {
					label: df.label + " (" + df.fieldtype + ")",
					value: df.fieldname,
				};
			});

			frappe.meta.get_docfield(
				"Web Form Beta Field",
				"fieldname",
				frm.doc.name
			).options = [""].concat(options);
		});
	},
};

frappe.ui.form.on("Web Form Beta", {
	refresh: function(frm) {
		// frm.get_field("is_standard").toggle(frappe.boot.developer_mode);
		// frm.set_value("reference_doctype", "Note")
		frappe.web_form.set_fieldname_select(frm);

		frm.add_custom_button(__("Get All Fields"), () => {
			frappe.web_form.set_fields_table(frm);
		});

		frm.add_custom_button(__("Get Mandatory Fields"), () => {
			frappe.web_form.set_fields_table(frm, true);
		});
	},

	title: function(frm) {
		if (frm.doc.__islocal) {
			var page_name = frm.doc.title.toLowerCase().replace(/ /g, "-");
			frm.set_value("route", page_name);
			frm.set_value("success_url", "/" + page_name);
		}
	},

	reference_doctype: function(frm) {
		frappe.web_form.set_fieldname_select(frm);
	},
});

frappe.ui.form.on("Web Form Beta Field", {
	fieldname: function(frm, doctype, name) {
		// eslint-disable-next-line no-console
		console.log(frm, doctype, name);
	},
});
