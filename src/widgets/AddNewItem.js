var apiUtil = require('../util/APIUtil.js');
var enumUtil = require('../util/EnumUtil.js');

const {Button, Composite, TextView, TextInput, Picker, AlertDialog, Page, ui, CheckBox} = require("tabris");

module.exports = class AddNewItem extends Composite {
    
    constructor(loadAccounts, openCustomProfile, properties) {
        super(properties);
        this._createUI(loadAccounts, openCustomProfile);
        this._applyLayout();
    }

    _createUI(loadAccounts, openCustomProfile) { 
        // create the UI elements to edit or create a new Item

        // create a custom item profile to be used in adding new items
        var customProfile = {
            profileName: "Custom",
        };

        // load the the configured profiles into the array and then append the custom profile
        var itemProfiles = [];
        var savedProfiles = JSON.parse(localStorage.getItem("itemProfiles"));
        savedProfiles.forEach(function(element) {
            itemProfiles.push(element);
        });
        itemProfiles.push(customProfile);

        // Profile to use
        new TextView({
            id: "profileLabel",
            alignment: 'left',
            text: "Profile:"
        }).appendTo(this);
        new Picker({
            id: "profilePicker",
            alignment: 'left',
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
            alignment: 'left',
            message: "What is the item?"
        }).appendTo(this);

        // amount
        new TextView({
            id: "amountLabel",
            alignment: 'left',
            text: "Amount:"
        }).appendTo(this);
        new TextInput({    
            id: "amountInput",
            alignment: 'left',
            message: "$100.00"
        }).appendTo(this);

        // credit
        new CheckBox({
            id: 'creditCheckbox',
            text: "Credit?",
            checked: false
        })
        .appendTo(this);

        // tax deductible
        new CheckBox({
            id: 'deductibleCheckbox',
            text: "Tax Deductible?",
            checked: false
        })
        .appendTo(this);

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
            var subTypeMultiplier = this.children('#creditCheckbox').first().checked ? 1 : -1;
            var amount = Number(this.children('#amountInput').first().text) * subTypeMultiplier;
            var subtypeId = amount < 0 ? 0 : 1;
            var quarterId = enumUtil.GetQuarterForMonth(today.getMonth() + 1);

            var newItem = {
                "monthId":          Math.floor(today.getMonth() + 1),
                "day":              Math.floor(today.getDate()),
                "dayOfWeekId":      Math.floor(today.getDay() + 1),
                "year":             Math.floor(today.getFullYear()),
                "description":      this.children('#descriptionInput').first().text,
                "amount":           amount,
                "subtypeId":        subtypeId,
                "quarter":          quarterId,
                "isTaxDeductible":  this.children('#deductibleCheckbox').first().checked
            };

            // load the customizedProfile from memory
            var customizedProfile = JSON.parse(localStorage.getItem("customizedProfile"));
            if (chosenProfile.profileName != "Custom" || (customizedProfile != null && customizedProfile.isReady)) {

                // if the customizedProfile has been loaded from user input, set the chosenProfile to it
                if (customizedProfile != null && customizedProfile.isReady) {
                    chosenProfile = customizedProfile;
                }

                newItem.subcategoryKey = chosenProfile.subcategory;
                newItem.typeId = chosenProfile.type;
                newItem.paymentMethodKey = chosenProfile.paymentMethod;
                newItem.statusId = chosenProfile.status;

                // lower the isReady flag
                customizedProfile.isReady = false;
                localStorage.setItem("customizedProfile", JSON.stringify(customizedProfile));

                // persist the new item via the API
                apiUtil.addNewItem(newItem, loadAccounts);
            } else {
                var page = new Page({
                    title: "Item Details"
                });

                // open the details page to enter custom profile details
                openCustomProfile(page, chosenProfile);
            }
        })
        .appendTo(this);
    }

    _applyLayout() {
        this.apply({
            '#profileLabel': {left: 10, top: 0, width: 120},
            '#profilePicker': {left: '#profileLabel 10', right: 10, baseline: '#profileLabel'},
            '#descriptionLabel': {left: 10, top: '#profileLabel 18', width: 120},
            '#descriptionInput': {left: '#descriptionLabel 10', right: 10, baseline: '#descriptionLabel'},
            '#amountLabel': {left: 10, top: '#descriptionLabel 18', width: 120},
            '#amountInput': {left: '#amountLabel 10', right: 10, baseline: '#amountLabel'},
            '#creditCheckbox': {left: 10, top: '#amountLabel 18', right: 10 },
            '#deductibleCheckbox': {left: 10, top: '#creditCheckbox 18', right: 10 },
            '#saveButton': {centerY: 250, left: 10, right: 10, height: 62}
        });
    }
}