'use strict';

var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var Q = require('q');

/*
 * Task: Send email
 * Parameters:
 * o Object 'email':
 *   - string 'from': <name> /<<sender email>/>
 *   - string 'to': <receiver email>
 *   - string 'subject': <email subject>
 *   - string 'text': <plaintext body>
 *   - string 'html': <html body>
 * o Object 'smtpSettings'
 *   - string 'host': <smtp server url>
 *   - number 'port': <smtp server port>
 *   - Object 'auth':
 *     * String 'user': <sender email>
 *     * String 'pass': <sender password>
 *   - boolean 'ignoreTLS': true
 */
module.exports.sendMail = function(email, smtpSettings) {
    var deferred = Q.defer();

    // create mail transporter
    var transporter = createMailTransporter(smtpSettings);

    try {
        // input validation
        checkValidParameters(email);

        // send
        transporter.sendMail(email, function(err, info) {
            if (err) {
                console.log(err);
                deferred.reject(new Error(err));
            } else {
                console.log('[Mailer] sendMail(): message sent: ' + info.response);
                deferred.resolve();
            }
        });
    } catch (err) {
        deferred.reject(err);
    }
    return deferred.promise;
};

/*
 * Task: Create mail transporter
 */
function createMailTransporter(smtpSettings) {
    return nodemailer.createTransport(smtpTransport(smtpSettings));
}

/*
 * Task: Check necessary params for email
 */
function checkValidParameters(email) {
    var necessaryParameters = [
        'from',
        'to',
        'subject',
        'text',
        'html'
    ];
    necessaryParameters.forEach(function(necessaryParameter) {
        if (!(necessaryParameter in email)) {
            throw '[Mailer] checkValidParameters(): missing paremeters';
        }
    });
};