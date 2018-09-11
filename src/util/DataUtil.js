var apiUtil = require('./BudgetAPIUtil.js');

const {AlertDialog} = require('tabris');

// upon loading this module, get the API data we might need on a regular basis
LoadData();

// initialize variables to store the various data types
var paymentMethods;
var categories;
var subcategories;
var paymentMethodsReady = false;
var categoriesReady = false;
var subcategoriesReady = false;

function LoadData() {
    apiUtil.getPaymentMethods(savePaymentMethods);
    apiUtil.getCategories(saveCategories);
    apiUtil.getSubcategories(saveSubcategories);
}

// asynchronous callbacks
function savePaymentMethods(json) {
    var allPaymentMethods = json.data;

    // initialize the Payment Methods array
    paymentMethods = [];

    // push a blank payment method on top
    paymentMethods.push({paymentMethodName: '', key: '-1'});

    // filter through payment methods to get only active ones
    for (var i = 0; i < allPaymentMethods.length; i++) {
        if (allPaymentMethods[i].isActive) {
            paymentMethods.push(allPaymentMethods[i]);
        }
    }

    // once done, set the paymentMethodsReady flag to true
    paymentMethodsReady = true;
}

function saveCategories(json) {
    var allCategories = json.data;

    // initialize the Categories arrary and push the first blank item
    categories = [];

    // push a blank category on top
    categories.push({categoryName: '', key: '-1'});
    
    // filter through categories to get only active ones
    for (var i = 0; i < allCategories.length; i++) {
        if (allCategories[i].isActive) {
            categories.push(allCategories[i]);
        }
    }

    // once done set the categoriesReady flag to true
    categoriesReady = true;
}

function saveSubcategories(json) {
    var allSubcategories = json.data;

    // initialize the subcategories arrary and push the first blank item
    subcategories = [];

    // push a blank subcategory on top
    subcategories.push({name: '', key: '-1', categoryKey: '-1'});

    // filter through subcategories to get only active ones
    for (var i = 0; i < allSubcategories.length; i++) {
        if (allSubcategories[i].isActive) {
            subcategories.push(allSubcategories[i]);
        }
    }    

    // once done set the subcategoriesReady flag to true
    subcategoriesReady = true;
}

// getters
function getPaymentMethods() {
    return paymentMethods;
}

function getCategories() {
    return categories;
}

function getSubcategories() {
    return subcategories;
}

function getAllDataLoaded() {
    return paymentMethodsReady && categoriesReady && subcategoriesReady;
}

function buildSubcategoriesForCategory(categoryKey) {
    var allActiveSubcategories = getSubcategories();
    var subcategoriesForCategory = [];

    // loop through subcategories and set up the subcategory picker with this categories members
    for (var i = 0; i < allActiveSubcategories.length; i++) {
        if (allActiveSubcategories[i].categoryKey == categoryKey) {
            subcategoriesForCategory.push(allActiveSubcategories[i]);
        }
    }

    return subcategoriesForCategory;
}

exports.GetPaymentMethods = getPaymentMethods;
exports.GetCategories = getCategories;
exports.GetSubcategories = getSubcategories;
exports.GetAllDataLoaded = getAllDataLoaded;
exports.BuildSubcategoriesForCategory = buildSubcategoriesForCategory;
exports.LoadData = LoadData;