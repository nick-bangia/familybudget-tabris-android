var apiUtil = require('../util/APIUtil.js');
var enumUtil = require('../util/EnumUtil.js');

const {Button, Composite, TextView, TextInput, Picker, AlertDialog, Page, ui} = require("tabris");

module.exports = class AddNewItem extends Composite {
    
    constructor(loadAccounts, properties) {
        super(properties);
        this._createUI(loadAccounts);
        this._applyLayout();
    }

    _createUI() { 
        // create the UI elements to edit or create a new Item
        var itemProfiles = JSON.parse(localStorage.getItem("itemProfiles"));

        // Profile to use
        new TextView({
            id: "profileLabel",
            alignment: 'left',
            text: "Profile:"
        }).appendTo(this);
        new Picker({
            id: "profilePicker",
            itemCount: itemProfiles.length,
            itemText: index => itemProfiles[index].profileName
        }).appendTo(this);

       // description
       new TextView({
           id: "descriptionLabel",
           alignment: 'left',
           text: "Description:"
       }).appendTo(this);
       new TextInput({
           id: "descriptionInput",
           message: "What is the item?"
       }).appendTo(this);

       // amount
       new TextView({
           id: "amountLabel",
           alignment: 'left',
           text: "Amount:"
       }).appendTo(this);
       new TextInput({    
           id: "amountInput"
       }).appendTo(this);

        // save button
        new Button({
            id: "saveButton",
            text: "Save",
            background: '#007729',
            textColor: "white"
        })
        .on('select', () => {
            
            var today = new Date();
            var chosenProfile = itemProfiles[this.children('#profilePicker').first().selectionIndex];
            var amount = Number(this.children('#amountInput').first().text);
            var subtypeId = amount < 0 ? 0 : 1;
            var quarterId = enumUtil.GetQuarterForMonth(today.getMonth() + 1);

            var newItem = {
                "monthId":          Math.floor(today.getMonth() + 1),
                "day":              Math.floor(today.getDate()),
                "dayOfWeekId":      Math.floor(today.getDay() + 1),
                "year":             Math.floor(today.getFullYear()),
                "subcategoryKey":   chosenProfile.subcategory,
                "description":      this.children('#descriptionInput').first().text,
                "amount":           amount,
                "typeId":           chosenProfile.type,
                "subtypeId":        subtypeId,
                "quarter":          quarterId,
                "paymentMethodKey": chosenProfile.paymentMethod,
                "statusId":         chosenProfile.status,
                "isTaxDeductible":  false
            };

            // persist the new item via the API
            apiUtil.addNewItem(newItem, loadAccounts);

        })
        .appendTo(this);
    }

    _applyLayout() {
        this.apply({
            '#profileLabel': {left: 10, top: 0, width: 120},
            '#profilePicker': {left: '#profileLabel 10', right: 10, width: 120},
            '#descriptionLabel': {left: 10, top: '#profileLabel 18', width: 120},
            '#descriptionInput': {left: '#descriptionLabel 10', right: 10, width: 200},
            '#amountLabel': {left: 10, top: '#descriptionLabel 18', width: 120},
            '#amountInput': {left: '#amountLabel 10', right: 10, width: 120},
            '#saveButton': {centerX: -50,  top: '#amountLabel 18'}
        });
    }
}