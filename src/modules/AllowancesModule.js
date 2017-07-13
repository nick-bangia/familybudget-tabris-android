var apiUtil = require("../util/APIUtil.js");
var formatUtil = require('../util/FormatUtil.js');
var timeAgo = require("time-ago");
var ta = timeAgo();
var coreNavigation = require('./CoreNavigation.js');

function setupDefaultAllowancesCollection(allowancesCollection) {
    
    // layout
    allowancesCollection.left = 0;
    allowancesCollection.right = 0;
    allowancesCollection.top = 0;
    allowancesCollection.bottom = 0;
    allowancesCollection.itemHeight = 80;

    // initialization of cells
    allowancesCollection.initializeCell = function(cell) {
        var itemNameView = new tabris.TextView({
            left: 16, right: 16, top: 4,
            markupEnabled: true,
            textColor: 'black',
            font: '18px'
        }).appendTo(cell);
        var itemAgeView = new tabris.TextView({
            left: 16, right: 16, top: [itemNameView, 4],
            markupEnabled: true,
            textColor: '#4a4a4a'
        }).appendTo(cell);
        var totalBalanceTextView = new tabris.TextView({
            right: 16, top: 4,
            alignment: "right",
            markupEnabled: true,
            textColor: 'black',
            font: "18px"
        }).appendTo(cell);
        var reconciledLabelTextView = new tabris.TextView({
            right: 128, top: [totalBalanceTextView, 4],
            alignment: "right",
            markupEnabled: true,
            textColor: '#4a4a4a',
            text: "<em>Reconciled:</em>"
        }).appendTo(cell);
        var reconciledBalanceTextView = new tabris.TextView({
            right: 16, top: [totalBalanceTextView, 4],
            alignment: "right",
            markupEnabled: true,
            textColor: '#4a4a4a'
        }).appendTo(cell);
        var pendingLabelTextView = new tabris.TextView({
            right: 128, top: [reconciledLabelTextView, 4],
            alignment: "right",
            markupEnabled: true,
            textColor: '#4a4a4a',
            text: "<em>Pending:</em>"
        }).appendTo(cell);
        var pendingBalanceTextView = new tabris.TextView({
            right: 16, top: [reconciledLabelTextView, 4],
            alignment: "right",
            markupEnabled: true,
            textColor: '#4a4a4a'
        }).appendTo(cell);
        cell.on('change:item', function({value: item}) {
            itemNameView.text = "<strong>" + item.name + "</strong>";
            itemAgeView.text = ta.ago(item.latestTransactionDate);
            totalBalanceTextView.text = "<strong>" + formatUtil.FormatCurrency(item.reconciledAmount + item.pendingAmount) + "</strong>";
            reconciledBalanceTextView.text = "<em>" + formatUtil.FormatCurrency(item.reconciledAmount) + "</em>";
            pendingBalanceTextView.text = "<em>" + formatUtil.FormatCurrency(item.pendingAmount) + "</em>";

            // apply currency styles
            if ((item.reconciledAmount + item.pendingAmount) < 0) {
                totalBalanceTextView.textColor = "red";
            }
            if (item.reconciledAmount < 0) {
                reconciledBalanceTextView.textColor = "red";
            }
            if (item.pendingAmount < 0) {
                pendingBalanceTextView.textColor = "red";
            }
        });
        cell.highlightOnTouch = true;
    };

    // event handling
    allowancesCollection.on('select', function({item: allowance}) {
        if (allowance.hasOwnProperty("items")) {
            openNewList(allowance.name, allowance.items);
        }
    });

    return allowancesCollection;
}

function openNewList(listName, allowanceList) {
    // create a new Allowances Collection and fill it with the new list
    var allowancesCollection = new tabris.CollectionView();
    allowancesCollection = setupDefaultAllowancesCollection(allowancesCollection)
    allowancesCollection.items = allowanceList;

    // call coreNavigation to open a new page with this new collection in it
    coreNavigation.OpenAllowancesPage(listName, allowancesCollection);
}

function createAllowancesCollection(callback) {

    // call the API to get the allowances
    apiUtil.getAllowances(checkAllowancesResponse, consumeAllowancesResponse, callback);
}

function checkAllowancesResponse(response) { 
    if (response.status != 200) {
        // if request is unsuccessful, show message, and return false
        new tabris.AlertDialog({
            message: "Unable to get latest allowances at the moment",
            buttons: {'ok': 'OK'}
        }).open();

        return false;

    } else {
        // if request is successful, return true
        return true;
    }
}

function consumeAllowancesResponse(allowancesResponse, finished) {
    // create a new Collection with defaults and set the items from the passed in data
    var allowancesCollection = new tabris.CollectionView();
    allowancesCollection = setupDefaultAllowancesCollection(allowancesCollection)
    allowancesCollection.items = allowancesResponse.data;

    finished(allowancesCollection);
}

exports.GetAllowancesCollection = createAllowancesCollection;