var pageLoad = 3000
module.exports = {
	beforeEach: browser => {
		browser
			.url(browser.launch_url + '/login')
			.waitForElementVisible('body', pageLoad)
      .assert.title('Login')
			.assert.visible('#login_email', 'Check if login box is visible')
			.setValue("#login_email", "Administrator")
			.setValue("#login_password", "frappe")
			.click(".btn-login")
			.waitForElementVisible("#body_div", pageLoad)
      .assert.title('Desktop')
      .url(browser.launch_url + '/desk#List/User/List')
      .pause(pageLoad)
      .assert.title('User');
	},

  'Create User': browser =>{
    browser
      .assert.visible('button.btn.btn-primary.btn-sm.primary-action span', 'Check if New Button is visible')
      .click('button.btn.btn-primary.btn-sm.primary-action span')
      .waitForElementVisible('div.control-input input[data-fieldname="email"]', pageLoad)
      .setValue('div.control-input input[data-fieldname="email"]','test@test.com')
      .setValue('div.control-input input[data-fieldname="first_name"]','testUser')
      .click('div.modal.fade.in > div.modal-dialog > div > div.modal-header > div > div.col-xs-5 > div > button[type="button"].btn.btn-primary.btn-sm')
      .url(browser.launch_url + '/desk#List/User/List')
      .pause(pageLoad)
      .assert.visible('a[data-name="test@test.com"]', 'Test User Created Successfully');
  },

  // 'Check User Status': browser => {
  //   browser
  //     .assert.visible('div.result-list > div > div:nth-child(1) > div.list-item > div.list-item__content.ellipsis.list-item__content--flex-2 > a[data-name="test@test.com"]','Test User Exists')
  //     .assert.visible('div.result-list > div > div:nth-child(1) > div.list-item > div[title="User Type: Website User"]', 'Test user is website user')
  //     .click('a[data-name="test@test.com"]')
  //     .pause(pageLoad)
  //     .assert.title('testUser - test@test.com')
  //     .click('div#page-Form/User button.btn.btn-default.btn-add.btn-sm')
  //     .pause(pageLoad)
  // },

  'Set User Password': browser =>{
    browser
      .waitForElementVisible('body' ,pageLoad)
      .click('a[data-name="test@test.com"]')
      .pause(pageLoad)
      .assert.title('testUser - test@test.com')
      .click('div[data-page-route="Form/User"] div:nth-child(5) > div.section-head.collapsed > a')
      .assert.visible('div.control-input input[type=Password]','PasswordField Visible')
      .setValue('div.control-input input[type=Password]','testpass')
      .click('div[data-page-route="Form/User"] button.btn.btn-primary.btn-sm.primary-action')
      .waitForElementVisible('div[data-page-route="Form/User"] h1 > span.indicator.green', pageLoad, 'Password Set Successfully')
      .pause(pageLoad)
  },

  'Delete User': browser =>{
    browser
      .waitForElementVisible('body' ,pageLoad)
      .click('a[data-name="test@test.com"]')
      .pause(pageLoad)
      .assert.title('testUser - test@test.com')
      .click('[data-page-route="Form/User"] .menu-btn-group')
      .click('ul[class="dropdown-menu"][role="menu"] > li:nth-child(13) > a')
      .waitForElementVisible('div.modal.fade.in > div.modal-dialog > div > div.modal-header', pageLoad)
      .click('div.modal.fade.in > div.modal-dialog > div > div.modal-header > div > div.col-xs-5 > div > button[type="button"].btn.btn-primary.btn-sm')
      .pause(pageLoad)
      .assert.title('User')
      .assert.elementNotPresent('a[data-name="test@test.com"]','Test User Deleted Successfully');
  },

  after: browser => browser.end()
};
