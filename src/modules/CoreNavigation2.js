var apiUtil = require("../util/APIUtil.js");
var formatUtil = require("../util/FormatUtil.js");
var allowancesModule = require("./AllowancesModule.js");
var timeAgo = require("time-ago");
var ta = timeAgo();

const {CollectionView, Composite, ImageView, NavigationView, Page, TextView, WebView, ui, AlertDialog} = require('tabris');

let navigationView = new NavigationView({
    left: 0, top: 0, right: 0, bottom: 0
  }).appendTo(ui.contentView);

loadAccounts();

function loadAccounts() {
  if (typeof accountsPage === 'undefined') {
    // accountsPage has not been loaded yet (or has already been disposed of)
    accountsPage = new Page({
      title: 'Accounts'
    }).appendTo(navigationView);

    allowancesModule.LoadAccounts(accountsPage);
  }  
}

function loadNewCollection(pageTitle, collection) {
  var newPage = new Page({
    title: pageTitle
  }).appendTo(navigationView);

  collection.appendTo(newPage);
}

exports.LoadNewAllowancesPage = loadNewCollection;