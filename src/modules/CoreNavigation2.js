var apiUtil = require("../util/APIUtil.js");
var formatUtil = require("../util/FormatUtil.js");
var timeAgo = require("time-ago");
var ta = timeAgo();

const {CollectionView, Composite, ImageView, NavigationView, Page, TextView, WebView, ui, AlertDialog} = require('tabris');

let loading;
let items = [];

let navigationView = new NavigationView({
  left: 0, top: 0, right: 0, bottom: 0
}).appendTo(ui.contentView);

let page = new Page({
  title: 'Accounts'
}).appendTo(navigationView);

let collectionView = new CollectionView({
  left: 0, top: 0, right: 0, bottom: 0,
  background: '#f5f5f5',
  refreshEnabled: true,
  cellHeight: 96,
  cellType: index => items[index].loading ? 'loading' : 'normal',
  createCell: (type) => {
    if (type === 'normal') {
      return createItemCell();
    }
    return createLoadingCell();
  },
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
}).appendTo(page);

loadInitialItems();

function createItemCell() {
  let cell = new Composite();
  let container = new Composite({
    id: 'container',
    left: 16, right: 16, top: 8, bottom: 8,
    cornerRadius: 2,
    elevation: 2,
    background: 'white',
    highlightOnTouch: true
  }).appendTo(cell);
  //.on('tap', ({target: view}) => createDetailsPage(view.item.data))  
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

function createLoadingCell() {
  return new TextView({
    centerY: 0,
    alignment: 'center',
    text: 'Loading...'
  });
}

function loadInitialItems() {
  console.log("About to load initial items...");
  collectionView.refreshIndicator = true;
  apiUtil.getAllowances(function (json) {
    items = json.data;
    collectionView.itemCount = items.length;
    collectionView.refreshIndicator = false;
  })
}