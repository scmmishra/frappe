class Chat {
	constructor() { }

	setup() {
		$(`<div class="chat-badge">
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-message-circle"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
			</div>`).appendTo(document.body);

		this.show_chat()
	}

	show_chat() {
		$(`<div class="chat">
			<div class="chat-header">
				<h4>Frappe Support</h4>
			</div>
			<div class="chat-body">
				<div class="chat-card">
					<h6 class="text-muted">Message Us</h6>
				</div>
				<div class="chat-card">
					<h6 class="text-muted">FAQ</h6>
					<div class="break"></div>
					<p>Pricing Plans</p>
					<p>Enterprise Support</p>
					<p>How do I reset my password?</p>
				</div>
			</div>
		</div>`).appendTo(document.body);
	}
}

frappe.chat = new Chat();