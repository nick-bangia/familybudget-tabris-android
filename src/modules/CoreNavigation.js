var PageSelector = require("../widgets/PageSelector.js"); 
var ItemProfileSelector = require("../widgets/ItemProfileSelector.js");
var ItemProfile = require("../widgets/ItemProfile.js");
var AddNewItem = require("../widgets/AddNewItem.js");
var allowancesModule = require("./Allowances.js");
var SettingsPage = require("../pages/settingsPage.js");

const {Action, CollectionView, Composite, ImageView, NavigationView, Page, TextView, WebView, ui, AlertDialog} = require('tabris');

// setup the navigation view
let navigationView = new NavigationView({
    left: 0, top: 0, right: 0, bottom: 0,
    drawerActionVisible: true
  }).appendTo(ui.contentView);


// setup the drawer
ui.drawer.enabled = true;
ui.drawer.append(
  new PageSelector(openNewPage, {
    left: 0, top: 16, right: 0, bottom: 0
  })
);

// create the settings icon action button
new Action({
  id: 'settingsAction',
  title: 'Settings',
  placementPriority: 'high',
  image:  {
    src: 'images/ic_settings.png'
  }
}).on('select', () => new SettingsPage().appendTo(navigationView))
  .appendTo(navigationView); 

function openNewPage(newPage) {
  
  switch (newPage.title) {
    case "Accounts":
      // load accounts page
      allowancesModule.LoadAccounts(newPage);
      break;
    case "Add New Items":
      newPage.append(
        new AddNewItem(loadAccounts, openCustomProfile, {
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
  navigationView.pages().dispose();
  var newPage = new Page({
    title: "Accounts"
  });
  newPage.appendTo(navigationView);

  openNewPage(newPage);
}

function openCustomProfile(detailsPage, profile) {
  navigationView.pageAnimation = 'none';
  detailsPage.appendTo(navigationView);
  navigationView.pageAnimation = 'default'; 

  // create the Item Profile and append it to the page
  new ItemProfile(
    profile,
    null,
    { left: 0, top: 16, right: 0, bottom: 0 }
  ).appendTo(detailsPage);
}

function loadNewCollection(pageTitle, collection) {
  var newPage = new Page({
    title: pageTitle
  }).appendTo(navigationView);

  collection.appendTo(newPage);
}

exports.LoadNewCollectionPage = loadNewCollection;
exports.OpenPage = openNewPage;