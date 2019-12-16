import { generate_route } from "./utils";
import Widget from "./base_widget.js";

export default class LinkWidget extends Widget {
	constructor(opts) {
		super(opts);
	}

	get_link() {
		return this.type === "module"
			? "#modules/" + this.name
			: this.options.link;
	}

	make_widget() {
		this.widget = $(`<div class="border module-box" data-module-name="${
			this.name
		}" tab-index="10">
			<div class="flush-top">
				<div class="module-box-content">
					<div class="level module-box-content-wrapper">
						<a class="module-box-link" href="${this.get_link()}">
							<h4 class="h4">
							<div>
								<i class="${
									this.options.icon
								}" style="color:#8d99a6;font-size:18px;margin-right:6px;"></i>
								${this.label}
							</div>
							</h4>
						</a>
					</div>
				</div>
			</div>
		</div>`);
	}
}
