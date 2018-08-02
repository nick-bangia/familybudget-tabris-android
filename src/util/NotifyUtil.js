var notifyConfig = require('../config/notificationConfig.json');

function notify(fromSender, toRecipients, notifySubject, notifyMessage) {
    // setup the JSON payload
    var payload = {
        recipients: toRecipients,
        from: fromSender,
        subject: notifySubject,
        message: notifyMessage
    };

    // setup the request headers
    var notificationHeaders = new Headers();
    notificationHeaders.append("Content-Type", 'application/json');
    
    // setup the request options
    var requestOptions = { method: "POST",
                           headers: notificationHeaders,
                           mode: "CORS",
                           cache: "default",
                           body: JSON.stringify(payload) };

    // send the request
    fetch(notifyConfig.notificationUrl, requestOptions);
}

exports.Notify = notify;