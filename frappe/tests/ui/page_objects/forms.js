module.exports = {
    '@disabled': true,
    url: function() {
        return this.api.launchUrl + '/desk#List';
    },
    elements: {
        menu: {
            selector: 'div[data-page-route="Form/User"] div.menu-btn-group'
        },
        delete: {
            selector: 'ul[class="dropdown-menu"][role="menu"] > li:nth-child(13) > a'
        },
        rename: {
            selector: 'ul[class="dropdown-menu"][role="menu"] > li:nth-child(9) > a'
        },
        modalPrimaryButton: {
            selector: 'div.modal.fade.in > div.modal-dialog > div > div.modal-header > div > div.col-xs-5 > div > button[type="button"].btn.btn-primary.btn-sm'
        },
        modalDefaultButton: {
            selector: 'div.modal.fade.in > div.modal-dialog > div > div.modal-header > div > div.col-xs-5 > div > button[type="button"].btn.btn-default.btn-sm.btn-modal-close'
        }
    },
    commands: [{
        clickMenuItem: function(option) {
            return this.api.useXpath().click('//ul/li/a[contains(text(),\"'+ option +'\")]');
        },
        clickButtonWithText: function(text) {
            return this.api.useXpath().click('//button[contains(text(),\"'+ text +'\")]');
        }
    }]
};
