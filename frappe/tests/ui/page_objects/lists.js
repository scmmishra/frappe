module.exports = {
    '@disabled': true,
    elements: {
        refresh: {
            selector: '.page-actions button.btn.btn-secondary.btn-default.btn-sm.hidden-xs'
        },
        new: {
            selector: '.page-actions button.btn.btn-primary.btn-sm.primary-action'
        },
        modalFormEmail: {
            selector: '.modal-content .control-input input[data-fieldname="email"]'
        },
        modalFormFirstName: {
            selector: '.modal-content .control-input input[data-fieldname="first_name"]'
        },
        modalSaveButton: {
            selector: 'div.modal.fade.in > div.modal-dialog > div > div.modal-header > div > div.col-xs-5 > div > button[type="button"].btn.btn-primary.btn-sm'
        },
        modalCloseButton: {
            selector: 'div.modal.fade.in > div.modal-dialog > div > div.modal-header > div > div.col-xs-5 > div > button[type="button"].btn.btn-default.btn-sm.btn-modal-close'
        }
    },
    commands: [{
        // navigateToList: function(location) {
        //     return this
        //         .api.url(this.api.launch_url + '/desk#List/'+location+'/List')
        //         .pause('3000')
        //         .assert.title(location);
        // },
        clickRefresh: function() {
            return this.clickButtonWithText('Refresh')
        },
        clickSave: function() {
            return this.clickButtonWithText('Save')
        },
        clickNew: function() {
            return this.clickButtonWithText('New')
        },
        clickButtonWithText: function(text) {
            return this.api.useXpath().click('//button[contains(text(),\"'+ text +'\")]');
        }
    }]
};
