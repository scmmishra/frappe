module.exports = {
    url: function() {
        return this.api.launchUrl + '/login';
    },
    elements: {
        usernameField: {
            selector: 'input#login_email'
        },
        passwordField: {
            selector: 'input#login_password'
        },
        loginButton: {
            selector: 'button.btn-login'
        }
    },
    commands: [{
        signInAsAdmin: function(password) {
            const ci_mode = this.api.launch_url.includes('localhost');
            if (ci_mode) password = 'admin';
            return this.login('Administrator', password);
        },
        login: function(user, pass) {
            return this
                .setValue('@usernameField', user)
                .setValue('@passwordField', pass)
                .click('@loginButton');
        }
    }]
};
