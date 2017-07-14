require("tabris-js-node");
var base64 = require('base-64');
var utf8 = require('utf8');
var apiUtil = require("../util/APIUtil.js");
const {AlertDialog} = require('tabris');

// create the main scrollView that will house all the input elements for the login page
var scrollView = new tabris.ScrollView({left: 0, top: 0, right: 0, bottom: 0}).appendTo(tabris.ui.contentView);

// splash image
new tabris.ImageView({
    id: 'splashImage',
    centerX: 0,
    centerY: -200,
    width: 450,
    height: 450,
    scaleMode: 'auto',
    image: 'images/login_logo.png'
}).appendTo(scrollView);

// input elements
new tabris.TextView({
    id: 'emailLabel',
    alignment: 'left',
    text: 'E-mail:'
}).appendTo(scrollView);

new tabris.TextInput({
    id: 'emailInput',
    message: 'Your E-mail'
}).appendTo(scrollView);

new tabris.TextView({
    id: 'passwordLabel',
    text: 'Password:'
}).appendTo(scrollView);

new tabris.TextInput({
    id: 'passwordInput',
    type: 'password',
    message: 'Password'
}).appendTo(scrollView);

// sign in button
new tabris.Button({
    id: 'loginButton',
    text: 'Sign In',
    background: '#007729',
    textColor: 'white'
})
.on('select', () => {
    loginToApi();    
}).appendTo(scrollView);

// apply UI layout
scrollView.apply({
    '#emailLabel': {left: 10, top: "45%", width: 120},
    '#emailInput': {left: '#emailLabel 10', right: 10, baseline: '#emailLabel'},
    '#passwordLabel': {left: 10, top: '#emailLabel 18', width: 120},
    '#passwordInput': {left: '#passwordLabel 10', right: 10, baseline: '#passwordLabel'},
    '#loginButton': {left: 10, right: 10, top: '#passwordInput 18'}
});

// loginToApi function - calls on the loginModule to login to the API and begin the application flow
function loginToApi() {
    // get username and password from the scrollView
    var username = scrollView.children('#emailInput').first().text;
    var password = scrollView.children('#passwordInput').first().text;
        
    // construct the base64 encoded username/password
    var stringToEncode = username + ':' + password;
    var encodedCredentials = base64.encode(utf8.encode(stringToEncode));

    // set up the request headers
    var loginHeaders = new Headers();
    loginHeaders.append("Authorization", "Basic " + encodedCredentials);
    
    // use the APIUtil to make the fetch request
    apiUtil.login(loginHeaders, startCoreNavigation);

    // dispose of the scrollview once login is complete
    scrollView.dispose();
}

function startCoreNavigation() {

    // load Core Navigation - runs automatically    
    require('../modules/CoreNavigation2.js');
}
