module.exports = {
	'@disabled': true,
	beforeEach: browser => {
		browser
			.url(browser.launch_url + '/login')
			.waitForElementVisible('body', 5000)
	},
	'Login': browser => {
		browser
			.assert.title('Login')
			.assert.visible('#login_email', 'Check if login box is visible')
			.setValue("#login_email", "Administrator")
			.setValue("#login_password", "admin")
			.click(".btn-login")
			.waitForElementVisible("#body_div", 20000);
	},
	after: browser => {
		browser.end();
	},
};
