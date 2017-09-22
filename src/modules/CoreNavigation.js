var apiUtil = require("../util/APIUtil.js");
var PageSelector = require("../widgets/PageSelector.js"); 
var ItemProfileSelector = require("../widgets/ItemProfileSelector.js");
var AddNewItem = require("../widgets/AddNewItem.js");
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
  
  switch (newPage.title) {
    case "Accounts":
      // load accounts page
      allowancesModule.LoadAccounts(newPage);
      break;
    case "Add New Items":
      newPage.append(
        new AddNewItem(loadAccounts, {
          left: 0, top: 16, right: 0, bottom: 0
        })
      );
      break;
    case "Item Profiles":
      // build the ItemProfiles selection composite widget and
      // append it to the new page
      newPage.append(
        new ItemProfileSelector(refreshItemProfileSelector, {
          left: 0, top: 5, right: 0, bottom: 0,
          background: '#f5f5f5'
        }
      ));
      break;
  }
}

function refreshItemProfileSelector() {
  // refresh the item profile selector
  // this method is called as a callback when the itemProfiles are modified 
  navigationView.pages().dispose();
  var newPage = new Page({
    title: "Item Profiles"
  });
  newPage.appendTo(navigationView);
  
  openNewPage(newPage);
}

function loadAccounts(responseData) {
  // load the accounts as a callback
  console.log("In loadAccounts function now...");
  navigationView.pages().dispose();
  var newPage = new Page({
    title: "Accounts"
  });
  newPage.appendTo(navigationView);

  openNewPage(newPage);
}

function loadNewCollection(pageTitle, collection) {
  var newPage = new Page({
    title: pageTitle
  }).appendTo(navigationView);

  collection.appendTo(newPage);
}

exports.LoadNewAllowancesPage = loadNewCollection;
exports.OpenPage = openNewPage;