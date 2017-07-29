var apiUtil = require('./APIUtil.js');

const {AlertDialog} = require('tabris');

// upon loading this module, get the API data we might need on a regular basis
LoadData();

// initialize variables to store the various data types
var paymentMethods;
var paymentMethodsReady = false;

function LoadData() {
    apiUtil.getPaymentMethods(savePaymentMethods);
}

// asynchronous callbacks
function savePaymentMethods(json) {
    paymentMethods = json.data;
    paymentMethodsReady = true;
}

// getters
function getPaymentMethods() {
    return paymentMethods;
}

function getAllDataLoaded() {
    return paymentMethodsReady;
}

exports.GetPaymentMethods = getPaymentMethods;
exports.GetAllDataLoaded = getAllDataLoaded;
exports.LoadData = LoadData;