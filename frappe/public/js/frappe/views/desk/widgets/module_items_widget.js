import { generate_route } from './utils';
import Widget from './base_widget.js'

export default class ModuleItemsWidget extends Widget {
	constructor(opts) {
		super(opts);
	}

	refresh() {
		//
	}

	set_body() {
		const is_link_disabled = (item) => {
			return item.dependencies && item.incomplete_dependencies;
		}
		const disabled_dependent = (item) => {
			return is_link_disabled(item) ? 'disabled-link' : '';
		}

		const get_indicator_color = (item) => {
			if(item.open_count) {
				return 'red';
			}
			if(item.onboard) {
				return item.count ? 'blue' : 'orange';
			};
			return 'grey';
		}

		const get_link_for_item = (item) => {
			if (is_link_disabled(item))
				return `<span class="link-content ellipsis">${item.label ? item.label : item.name}</span>
						<div class="module-link-popover popover fade top in" role="tooltip" style="display: none;">
							<div class="arrow"></div>
							<h3 class="popover-title" style="display: none;"></h3>
							<div class="popover-content" style="padding: 12px;">
								<div class="small text-muted">${__("You need to create these first: ")}</div>
								<div class="small">${ item.incomplete_dependencies.join(", ") }</div>
							</div>
						</div>`;

			if (item.youtube_id)
				return `<span class="link-content help-video-link ellipsis" data-youtubeid="${item.youtube_id}">${item.label ? item.label : item.name}</a>`

			return `<a href="${item.route}" class="link-content ellipsis">${item.label ? item.label : item.name}</a>`;
		}

		this.link_list = this.data.items.map(item => {
			return $(`<div class=" link-item flush-top small ${item.onboard ? 'onboard-spotlight': '' } ${disabled_dependent(item)}" type="${item.type}">
					<span class="indicator ${get_indicator_color(item)}"></span>
					${get_link_for_item(item)}
			</div>`);

		});

		this.link_list.forEach(link => link.appendTo(this.body));
	}

	setup_events() {
		this.link_list.forEach(link => {
			// Bind Popver Event
			const link_label = link.find('.link-content');

			if (link.hasClass('disabled-link')) {
				const popover = link.find('.module-link-popover');

				link_label.mouseover(() => popover.show());
				link_label.mouseout(() => popover.hide());

			} else {
				if (link_label.hasClass('help-video-link')) {
					link_label.click((event) => {
						let yt_id = event.target.dataset.youtubeid;
						frappe.help.show_video(yt_id)
					});
				} else {
					link_label.click(() => frappe.set_route(route))
				}
			}
		})
	}
}