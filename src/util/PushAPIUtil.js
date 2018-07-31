var pushAPIconfig = require('../config/pushConfig.json');

function push(pushContent) {
    // setup the JSON payload
    var payload = {
        app_key: pushAPIconfig.app_key,
        app_secret: pushAPIconfig.app_secret,
        target_type: "channel",
        target_alias: localStorage.getItem("PushToChannelAlias"),
        content: pushContent
    };

    // setup the request headers
    var pushedApiHeaders = new Headers();
    pushedApiHeaders.append("Content-Type", 'application/json');
    
    // setup the request options
    var requestOptions = { method: "POST",
                           headers: pushedApiHeaders,
                           mode: "CORS",
                           cache: "default",
                           body: JSON.stringify(payload) };

    // send the request
    fetch(pushAPIconfig.baseUrl, requestOptions)
    .then(function(response) {
        if (response.status != 200) {
            // if the request isn't successful, alert the user
            window.plugins.toast.showShortCenter("Unable to send push notification!");
        }
    })
}

exports.Push = push;