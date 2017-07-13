var pageConfig = require('../config/pageConfig.json');
var allowancesModule = require('./AllowancesModule.js');

var navigationView = new tabris.NavigationView({
  left: 0, top: 0, right: 0, bottom: 0,
  drawerActionVisible: true
}).appendTo(tabris.ui.contentView);

tabris.ui.drawer.enabled = true;

// create the collection of items for the drawer from the page configurations
new tabris.CollectionView({
  left: 0, top: 0, right: 0, bottom: 0,
  items: pageConfig,
  initializeCell: initializeCell,
  itemHeight: tabris.device.platform === 'iOS' ? 40 : 48
}).on('select', function({item: pageConfiguration}) {
  tabris.ui.drawer.close();
  navigationView.pages().dispose();
  openDrawerPage(pageConfiguration);
}).appendTo(tabris.ui.drawer);

// how to initialize each drawer item
function initializeCell(cell) {
  new tabris.Composite({
    left: 0, right: 0, bottom: 0, height: 1,
    background: '#bbb'
  }).appendTo(cell);
  var textView = new tabris.TextView({
    left: 30, centerY: 0,
    font: tabris.device.platform === 'iOS' ? '17px .HelveticaNeueInterface-Regular' : '14px Roboto Medium',
    textColor: tabris.device.platform === 'iOS' ? 'rgb(22, 126, 251)' : '#212121'
  }).appendTo(cell);
  cell.on('change:item', function({value: page}) {
    textView.set('text', page.title);
  });
}

// public function to open the first page
function displayAccountsPage() {
  
  // get the allowances and show the accounts page once complete
  allowancesModule.GetAllowancesCollection(openAccountsPage); 
}

function displayAddNewItemsPage() {
  new tabris.AlertDialog({
            message: "Imagine inputting new items here",
            buttons: {'ok': 'Let\'s Do It!'}
  }).open();
}

function openAccountsPage(allowancesCollection) {
  
  // create a new page and append the collection to it
  var accountsPage = new tabris.Page({
     title: pageConfig[0].title,
     autoDispose: false
   });

  accountsPage.append(allowancesCollection).appendTo(navigationView);
}

// code to open up a new drawer page
function openDrawerPage(page) {
  if (page.title == "Accounts") {
    displayAccountsPage();
  } else if (page.title == "Add New Items") {
    displayAddNewItemsPage();
  }
}

function openAllowancesPage(collectionName, allowancesCollection) {

  // create a new page and append the collection to it
  var allowancesPage = new tabris.Page({
    title: collectionName,
    autoDispose: false
  });

  allowancesPage.append(allowancesCollection).appendTo(navigationView);
}

exports.StartCoreNavigation = displayAccountsPage;
exports.OpenAllowancesPage = openAllowancesPage;