require("tabris-js-node");
var base64 = require('base-64');
var utf8 = require('utf8');
var apiUtil = require("../util/APIUtil.js");
const {ImageView, TextView, TextInput, Button, CheckBox, ScrollView, ui, AlertDialog} = require('tabris');
var rememberUsername = ( localStorage.getItem('rememberUsername') ? (localStorage.getItem('rememberUsername') == 'yes' ? true : false) : false );

// create the main scrollView that will house all the input elements for the login page
var scrollView = new ScrollView({left: 0, top: 0, right: 0, bottom: 0}).appendTo(ui.contentView);

// splash image
new ImageView({
    id: 'splashImage',
    centerX: 0,
    centerY: -200,
    width: 250,
    height: 250,
    scaleMode: 'auto',
    image: 'images/budget_logo.png'
}).appendTo(scrollView);

// input elements
new TextView({
    id: 'usernameLabel',
    alignment: 'left',
    text: 'Username:'
}).appendTo(scrollView);

new TextInput({
    id: 'usernameInput',
    message: 'Username or e-mail',
    text: localStorage.getItem('username') ? localStorage.getItem('username') : ''
}).appendTo(scrollView);

new TextView({
    id: 'passwordLabel',
    text: 'Password:'
}).appendTo(scrollView);

new TextInput({
    id: 'passwordInput',
    type: 'password',
    message: 'Password'
}).appendTo(scrollView);

new CheckBox({
    id: 'rememberCheckbox',
    text: "Remember my username",
    checked: localStorage.getItem("rememberUsername") == "yes" ? true : false
})
.on('checkedChanged', event => rememberUsername = event.value)
.appendTo(scrollView);

// sign in button
new Button({
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
    '#usernameLabel': {left: 10, top: "#splashImage 30", width: 120},
    '#usernameInput': {left: '#usernameLabel 10', right: 10, baseline: '#usernameLabel'},
    '#passwordLabel': {left: 10, top: '#usernameLabel 18', width: 120},
    '#passwordInput': {left: '#passwordLabel 10', right: 10, baseline: '#passwordLabel'},
    '#rememberCheckbox': {left: 10, top: '#passwordLabel 18', width: 240},
    '#loginButton': {centerY: 250, left: 10, right: 10, height: 62}
});

// loginToApi function - calls on the loginModule to login to the API and begin the application flow
function loginToApi() {

    // get username and password from the scrollView
    var username = scrollView.children('#usernameInput').first().text;
    var password = scrollView.children('#passwordInput').first().text;
    
    // store whether the user chose to remember their username
    if (rememberUsername) {
        // if the user chose to remember their username, store it here
        localStorage.setItem("rememberUsername", "yes");
        localStorage.setItem("username", scrollView.children('#usernameInput').first().text);
    } else {
        // otherwise, clear it from local storage so that next session's login is cleared
        localStorage.setItem("rememberUsername", "no");
        localStorage.removeItem("username");
    }
        
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
    require('../modules/CoreNavigation.js');
}
