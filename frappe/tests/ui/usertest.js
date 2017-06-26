const pageLoad = 3000;
module.exports = {
    beforeEach: browser => {
        var login = browser.page.login();
        login
            .navigate()
            .signInAsAdmin('frappe');

        browser
            .waitForElementVisible("#body_div", pageLoad)
            .url(browser.launch_url + '/desk#List/User/List')
            .pause(pageLoad)
            .assert.title('User');
    },

    'Create User': browser => {
        var lists = browser.page.lists();
        browser
            .pause(pageLoad)
        lists
            .clickNew()
            .waitForElementVisible('@modalFormEmail', pageLoad, 'Modal Form is visible')
            .setValue('@modalFormEmail', 'test@test.com')
            .setValue('@modalFormFirstName', 'testUser')
            .click('@modalSaveButton')
        browser
            // .pause(pageLoad)
            // .waitForElementVisible('div.control-input input[data-fieldname="email"]', pageLoad)
            // .setValue('div.control-input input[data-fieldname="email"]', 'test@test.com')
            // .setValue('div.control-input input[data-fieldname="first_name"]', 'testUser')
            //.click('div.modal.fade.in > div.modal-dialog > div > div.modal-header > div > div.col-xs-5 > div > button[type="button"].btn.btn-primary.btn-sm')
            .refresh()
            .pause(pageLoad)
            .assert.visible('a[data-name="test@test.com"]', 'Test User Created Successfully');
    },

    // 'Check User Status': browser => {
    //     browser
    //         //Check if first entry is the test user entry
    //         .assert.visible('div.result-list > div > div:nth-child(1) > div.list-item > div.list-item__content.ellipsis.list-item__content--flex-2 > a[data-name="test@test.com"]', 'Test User Exists')
    //         .assert.visible('div.result-list > div > div:nth-child(1) > div.list-item > div[title="User Type: Website User"]', 'Test is website user')
    //         //Modifying test user
    //         .click('a[data-name="test@test.com"]')
    //         .pause(pageLoad)
    //         .assert.title('testUser - test@test.com')
    //         .click('div[data-fieldname="roles_html"] > div > p > button.btn.btn.btn-default.btn-add.btn-sm') //Adding roles
    //         .click('div[data-page-route="Form/User"] button.btn.btn-primary.btn-sm.primary-action') //Saving
    //         .pause(pageLoad)
    //         .url(browser.launch_url + '/desk#List/User/List')
    //         .pause(pageLoad)
    //         .assert.visible('div.result-list > div > div:nth-child(1) > div.list-item > div[title="User Type: System User"]', 'Test is System user') //Checking if test is system user
    //
    //         .click('a[data-name="test@test.com"]')
    //         .pause(pageLoad)
    //         .assert.title('testUser - test@test.com')
    //         .click('div[data-fieldname="roles_html"] > div > p > button.btn.btn-sm.btn-default.btn-remove') //Revoking Roles
    //         .click('div[data-page-route="Form/User"] button.btn.btn-primary.btn-sm.primary-action') //Saving
    //         .pause(pageLoad)
    //         .url(browser.launch_url + '/desk#List/User/List')
    //         .pause(pageLoad)
    //         .assert.visible('div.result-list > div > div:nth-child(1) > div.list-item > div[title="User Type: Website User"]', 'Test is back to Website user') //Checking if test is website user
    // },
    //
    // 'Set User Password': browser => {
    //     browser
    //         //.waitForElementVisible('body' ,pageLoad)
    //         .click('a[data-name="test@test.com"]')
    //         .pause(pageLoad)
    //         .assert.title('testUser - test@test.com')
    //         .click('div[data-page-route="Form/User"] div:nth-child(5) > div.section-head.collapsed > a')
    //         .assert.visible('div.control-input input[type=Password]', 'PasswordField Visible')
    //         .setValue('div.control-input input[type=Password]', 'testpass')
    //         .click('div[data-page-route="Form/User"] button.btn.btn-primary.btn-sm.primary-action')
    //         .waitForElementVisible('div[data-page-route="Form/User"] h1 > span.indicator.green', pageLoad, 'Password Set Successfully')
    // },

    'Delete User': browser => {
        var form = browser.page.forms();
        browser
            .waitForElementVisible('body', pageLoad)
            .click('a[data-name="test@test.com"]')
            .pause(pageLoad)
            .assert.title('testUser - test@test.com')
        form
            .click('@menu')
            .clickMenuItem('Delete')

        browser
            .pause(pageLoad)

        form
            .clickButtonWithText('Yes')

        browser
            .pause(pageLoad)
            // .click('div.modal.fade.in > div.modal-dialog > div > div.modal-header > div > div.col-xs-5 > div > button[type="button"].btn.btn-primary.btn-sm')
            // .pause(pageLoad)
            .assert.title('User')
            .refresh()
            .assert.elementNotPresent('a[data-name="test@test.com"]', 'Test User Deleted Successfully');
    },

    after: browser => browser.end()
};
