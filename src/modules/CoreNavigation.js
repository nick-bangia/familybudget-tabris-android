var apiUtil = require("../util/APIUtil.js");
var PageSelector = require("./PageSelector.js"); 
var formatUtil = require("../util/FormatUtil.js");
var allowancesModule = require("./Allowances.js");
var timeAgo = require("time-ago");
var ta = timeAgo();

const {CollectionView, Composite, ImageView, NavigationView, Page, TextView, WebView, ui, AlertDialog} = require('tabris');

let navigationView = new NavigationView({
    left: 0, top: 0, right: 0, bottom: 0,
    drawerActionVisible: true
  }).appendTo(ui.contentView);

ui.drawer.enabled = true;
ui.drawer.append(
  new PageSelector(openNewPage, {
    left: 0, top: 16, right: 0, bottom: 0
  })
);

function openNewPage(newPage) {
  if (newPage.title == "Accounts") {
    // accountsPage has not been loaded yet (or has already been disposed of)
    allowancesModule.LoadAccounts(newPage);
  } else if (newPage.title == "Add New Items") {
    new AlertDialog({
      message: "Coming soon!",
      buttons: {ok: "Got it!"}
    }).open();
  }
}

function loadNewCollection(pageTitle, collection) {
  var newPage = new Page({
    title: pageTitle
  }).appendTo(navigationView);

  collection.appendTo(newPage);
}

exports.LoadNewAllowancesPage = loadNewCollection;
exports.OpenPage = openNewPage;