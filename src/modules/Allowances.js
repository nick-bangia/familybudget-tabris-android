var apiUtil = require("../util/BudgetAPIUtil.js");
var formatUtil = require('../util/FormatUtil.js');
var timeAgo = require("time-ago");
var ta = timeAgo();
var navigation = require("./CoreNavigation.js");

const {CollectionView, Composite, TextView, AlertDialog} = require('tabris');
var accountsCollectionView;

function loadAccounts(accountsPage) {
    // call on the API to get the allowances
    getAccountItems(createAccountsCollection, accountsPage);
}

function getAccountItems(callback, accountsPage) {
    apiUtil.getAllowances(function (json) {
      var items = json.data;
      
      callback(items, accountsPage);
    });
}

function createAccountsCollection(items, accountsPage) {
    // create a collectionView object with the accountItems
    accountsCollectionView = getAllowancesCollectionObject(items);
    accountsCollectionView.refreshEnabled = true;
    accountsCollectionView.appendTo(accountsPage);
    accountsCollectionView.refreshIndicator = true;
    accountsCollectionView.itemCount = items.length;
    accountsCollectionView.refreshIndicator = false;   
}

function getAllowancesCollectionObject(items) {
    // create a new CollectionView and initialize it to show allowances
    return new CollectionView({
        left: 0, top: 0, right: 0, bottom: 0,
        background: '#f5f5f5',
        refreshEnabled: false,
        cellHeight: 96,
        cellType: 'normal',
        createCell: createItemCell,
        updateCell: (view, index) => {
            let item = items[index];
            view.find('#container').first().item = item;
            view.find('#nameText').set('text', "<b>" + item.name + "</b>");
            view.find('#ageText').set('text', ta.ago(item.latestTransactionDate));
            view.find('#totalBalanceText').set('text', "<strong>" + formatUtil.FormatCurrency(item.reconciledAmount + item.pendingAmount) + "</strong>");
            view.find('#reconciledBalanceText').set('text', "<em>" + formatUtil.FormatCurrency(item.reconciledAmount) + "</em>");
            view.find('#pendingBalanceText').set('text', "<em>" + formatUtil.FormatCurrency(item.pendingAmount) + "</em>");
            
            // apply currency styles
            if ((item.reconciledAmount + item.pendingAmount) < 0) {
                view.find('#totalBalanceText').set('textColor', '#ff0000');
            }
            if (item.reconciledAmount < 0) {
                view.find('#reconciledBalanceText').set('textColor', '#ff0000');
            }
            if (item.pendingAmount < 0) {
                view.find('#pendingBalanceText').set('textColor', '#ff0000');
            }
        }
    }).on('refresh', function() {
        // load the accounts again and refresh the view
        // disable the refresh indicator once complete
        getAccountItems(function (collectionItems) {
            items = collectionItems;
            accountsCollectionView.refreshIndicator = true;
            accountsCollectionView.itemCount = items.length;
            accountsCollectionView.refresh();
            accountsCollectionView.refreshIndicator = false;
        });
    });
}

function createItemCell() {
    let cell = new Composite();
    let container = new Composite({
        id: 'container',
        left: 16, right: 16, top: 8, bottom: 8,
        cornerRadius: 2,
        elevation: 2,
        background: 'white',
        highlightOnTouch: true
    })
    .on('tap', ({target: view}) => allowanceSelected(view.item))
    .appendTo(cell);  
    new TextView({
        id: 'nameText',
        top: 4, left: 16, right: 16,
        textColor: '#000000',
        markupEnabled: true,
        font: '18px',
        maxLines: 2
    }).appendTo(container);
    new TextView({
        id: 'ageText',
        top: '#nameText 4', bottom: 8, right: 16, left: 16,
        textColor: '#4a4a4a'
    }).appendTo(container);
    new TextView({
        id: 'totalBalanceText',
        top: 4, right: 16,
        alignment: 'right',
        markupEnabled: true,
        textColor: '#000000',
        font: '18px'
    }).appendTo(container);
    new TextView({
        id: 'reconciledLabelText',
        right: 128, top: '#totalBalanceText 4',
        alignment: 'right',
        markupEnabled: true,
        textColor: '#4a4a4a',
        text: '<em>Reconciled:</em>'
    }).appendTo(container);
    new TextView({
        id: 'reconciledBalanceText',
        right: 16, top: '#totalBalanceText 4',
        alignment: 'right',
        markupEnabled: true,
        textColor: '#4a4a4a'
    }).appendTo(container);
    new TextView({
        id: 'pendingLabelText',
        right: 128, top: '#reconciledLabelText 4',
        alignment: 'right',
        markupEnabled: true,
        textColor: '#4a4a4a',
        text: '<em>Pending:</em>'
    }).appendTo(container);
    new TextView({
        id: 'pendingBalanceText',
        right: 16, top: '#reconciledLabelText 4',
        alignment: 'right',
        markupEnabled: true,
        textColor: '#4a4a4a'
    }).appendTo(container);
    
    return cell;
}

function allowanceSelected(allowance) {
  if (allowance.hasOwnProperty("items")) {
    var nextCollection = getAllowancesCollectionObject(allowance.items);
    nextCollection.refreshEnabled = false;
    nextCollection.refreshIndicator = true;
    nextCollection.itemCount = allowance.items.length;
    nextCollection.refreshIndicator = false;
    navigation.LoadNewCollectionPage(allowance.name, nextCollection);
  }
}

exports.LoadAccounts = loadAccounts;