var apiConfig = require('../config/apiConfig.json');
const {AlertDialog} = require('tabris');

function login(authorizationHeader, externalCallback) {
    
    // construct the login URL
    var loginUrl = apiConfig.baseUrl + apiConfig.loginUri;

    // construct the request options
    var requestOptions = { method: 'GET',
                           headers: authorizationHeader,
                           mode: 'cors',
                           cache: 'default' };

    executeRequest(loginUrl, requestOptions, saveAccessKeys, externalCallback);
}

function getAllowances(externalCallback) {

    // construct the allowances URL
    var refreshAllowancesUrl = apiConfig.baseUrl + apiConfig.refreshAllowancesUri;
    var getAllowancesUrl = apiConfig.baseUrl + apiConfig.budgetAllowancesUri;
    
    return executeAllowancesRequest(refreshAllowancesUrl, getAllowancesUrl, constructAuthorizedGetRequestOptions(), externalCallback);
}

function getPaymentMethods(externalCallback) {
    
    // construct the payment methods URL
    var paymentMethodsUrl = apiConfig.baseUrl + apiConfig.paymentMethodsUri;
    
    executeRequest(paymentMethodsUrl, constructAuthorizedGetRequestOptions(), null, externalCallback);
}

function getCategories(externalCallback) {
    
    // construct the categories URL
    var categoriesUrl = apiConfig.baseUrl + apiConfig.categoriesUri;

    executeRequest(categoriesUrl, constructAuthorizedGetRequestOptions(), null, externalCallback);
}

function getSubcategories(externalCallback) {
    
    // construct the categories URL
    var subcategoriesUrl = apiConfig.baseUrl + apiConfig.subcategoriesUri;

    executeRequest(subcategoriesUrl, constructAuthorizedGetRequestOptions(), null, externalCallback);
}

function addNewItem(payload, externalCallback) {
    
    // construct the add new item url
    var addNewItemUrl = apiConfig.baseUrl + apiConfig.addNewItemUri;

    executeRequest(addNewItemUrl, constructAuthorizedPutRequestOptions(payload), null, externalCallback);
}

function executeAllowancesRequest(refreshAllowancesUrl, getAllowancesUrl, requestOptions, externalCallback) {
    
    return fetch(refreshAllowancesUrl, requestOptions)
    .then(function(response) {
        // regardless of the outcome of the refresh allowances request, do the actual get allowances
        return executeRequest(getAllowancesUrl, requestOptions, null, externalCallback);
    });
}

function executeRequest(url, requestOptions, callback, externalCallback) {
   
    // make the request
    fetch(url, requestOptions)
    .then(function(response) {
        if (response.status != 200) {
            // if login is unsuccessful, show message, and return false
            new AlertDialog({
                message: "Invalid Credentials!",
                buttons: {'ok': 'OK'}
            }).open();

            return false;

        } else {
            // if login is successful, return true
            return response.json();
        }
    })
    .then(function(data) {
        if (data) {
           if (callback) {
               callback(data, externalCallback);
           } else {
               // if external callback is provided call on it
               if (externalCallback) {
                   externalCallback(data);
               }
           }
        }
    });
}

function constructAuthorizedGetRequestOptions() {
    // construct the authorization header
    var authorizationHeader = new Headers();
    authorizationHeader.append("x_access_token", localStorage.getItem("access_token"));

    // construct the request options
    var requestOptions = { method: 'GET',
                           headers: authorizationHeader,
                           mode: 'cors',
                           cache: 'default' };

    return requestOptions;
}

function constructAuthorizedPutRequestOptions(payload) {
    var putHeaders = new Headers();
    putHeaders.append("x_access_token", localStorage.getItem("access_token"));
    putHeaders.append("Content-Type", 'application/json');


    // construct the body of the put request
    var body = {
        "data": [payload] };

    // construct the request options
    var requestOptions = { method: 'PUT',
                           headers: putHeaders,
                           mode: 'cors',
                           cache: 'default',
                           body: JSON.stringify(body) };

    return requestOptions;
}

function saveAccessKeys(data, externalCallback) {
    var accessKeys = data.data[0];
    localStorage.setItem("access_token", accessKeys.access_token);
    localStorage.setItem("access_expiry", accessKeys.expires_on);
    localStorage.setItem("refreshToken", accessKeys.refresh_token);
    localStorage.setItem("refresh_expiry", accessKeys.refresh_expires_on);

    // call on the callback, if provided by the caller
    if (externalCallback) {
        externalCallback();
    }
}

exports.login = login;
exports.getAllowances = getAllowances;
exports.getPaymentMethods = getPaymentMethods;
exports.getCategories = getCategories;
exports.getSubcategories = getSubcategories;
exports.addNewItem = addNewItem;

