'use strict';

var cookie = require('cookie');
var escape = require('escape-html');

module.exports = function (req, res, next) {

    // Set a flash method to the res object
    // Usage : res.flash('error|info|success|warning', 'Your message here');
    // note: if we pass in an email string, add it to the cookie - this will be for failed login attempts
    res.flash = function (type, text, email) {

        var message = {
            type: type,
            text: text
        };

        if(email) {
            message.email = email;
        }

        res.cookie('cookie_flash_message', JSON.stringify(message), { httpOnly: true });
    };

    // Is there a flash message? If so, set it as a variable so that we can use it in the template
    if (req.headers.cookie) {
        var cookies = cookie.parse(req.headers.cookie);
        if (cookies.cookie_flash_message) {
            var flashMessage = JSON.parse(cookies.cookie_flash_message);

            // Escape any HTML the user may have added in the cookie
            var flashMessageEscaped = {
                type: escape(flashMessage.type),
                text: escape(flashMessage.text)
            }

            // add escaped email property as well if it was in the cookie
            if(flashMessage.email) {
                flashMessageEscaped.email = escape(flashMessage.email);
            }

            res.locals.flashMessage = flashMessageEscaped;

            // Clear previous flash messages (for the next request only). It won't affect the current request
            res.clearCookie('cookie_flash_message');
        }
    }

    next();
};
