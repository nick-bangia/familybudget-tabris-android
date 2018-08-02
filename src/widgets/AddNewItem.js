var apiUtil = require('../util/BudgetAPIUtil.js');
var notifyUtil = require('../util/NotifyUtil.js');
var enumUtil = require('../util/EnumUtil.js');
var dateFormat = require('dateformat');

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

        // test the device independent pixels
        console.log("Device Independent Pixels: " + window.devicePixelRatio);

        // load the the configured profiles into the array and then append the custom profile
        var itemProfiles = [];
        var savedProfiles = JSON.parse(localStorage.getItem("itemProfiles"));
        // if there are any saved profiles, load them into the itemProfiles array
        if (savedProfiles) {
            savedProfiles.forEach(function(element) {
                itemProfiles.push(element);
            });
        }
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
        })
        .on('select', ({index}) => {
            // if the custom option was chosen, load the item details page to provide the custom information
            // otherwise, do nothing
            if (itemProfiles[index].profileName == "Custom") {
                var page = new Page({
                    title: "Item Details"
                });
    
                // open the details page to enter custom profile details
                openCustomProfile(page, itemProfiles[index]);
            }
        })
        .appendTo(this);

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

        new Button({
            id: "saveAndAddButton",
            text: "Save and Add Another",
            background: '#007729',
            textColor: "white"
        })
        .on('select', () => {
            
            var chosenProfile = itemProfiles[this.children('#profilePicker').first().selectionIndex];
            this._saveNewItem(true, chosenProfile, loadAccounts, openCustomProfile);
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
            
            var chosenProfile = itemProfiles[this.children('#profilePicker').first().selectionIndex];
            this._saveNewItem(false, chosenProfile, loadAccounts, openCustomProfile);
        })
        .appendTo(this);
    }

    _saveNewItem(addAnother, chosenProfile, loadAccounts, openCustomProfile) {
        
        // initialize some values for the new item
        var today = new Date();
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

        // if the customizedProfile has been loaded from user input, set the chosenProfile to it
        if (customizedProfile != null && customizedProfile.isReady) {
            chosenProfile = customizedProfile;
            
            // lower the isReady flag
            customizedProfile.isReady = false;
            localStorage.setItem("customizedProfile", JSON.stringify(customizedProfile));
        }

        newItem.subcategoryKey = chosenProfile.subcategory;
        newItem.typeId = chosenProfile.type;
        newItem.paymentMethodKey = chosenProfile.paymentMethod;
        newItem.statusId = chosenProfile.status;

        // persist the new item via the API
        if (addAnother) {
            // call the API to add the new item, but don't provide a callback to get out of the current page
            apiUtil.addNewItem(newItem, null);

            // clear out the fields so a new item can be added
            this.children('#profilePicker').first().selectionIndex = 0;
            this.children('#descriptionInput').first().text = "";
            this.children('#amountInput').first().text = "";
            this.children('#creditCheckbox').first().checked = false;
            this.children('#deductibleCheckbox').first().checked = false;

        } else {
            // call the API to add the new item, and provide a callback to leave the current page
            apiUtil.addNewItem(newItem, loadAccounts);

            // if AutoPush is not turned on, ask if user wants to push
            if (localStorage.getItem("AutoPush") == "false") {

                new AlertDialog({
                    title: "Send a notification?",
                    message: "Do you want to send a notification about your changes?",
                    buttons: {
                        ok: 'Yes',
                        cancel: 'No'
                    }
                }).on({
                    closeOk: () => this._sendNotification()
                }).open();
            } else {
                // send the push notification automatically
                this._sendNotification();
            }
        }
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
            '#saveAndAddButton': {centerY: 180, left: 10, right: 10, height: 62},
            '#saveButton': {centerY: 250, left: 10, right: 10, height: 62}
        });
    }

    _sendNotification() {
        var firstName = localStorage.getItem("firstName");
        
        // set up recipients
        var recipientsArray = [];
        if (localStorage.getItem("notifyEmail") != "") {
            recipientsArray.push(localStorage.getItem("notifyEmail"));
        }
        if (localStorage.getItem("notifySMS") != "") {
            recipientsArray.push(localStorage.getItem("notifySMS") + "@txt.att.net");
        }

        // set up the subject & message
        var subject = "Family Budget Updated as of " + dateFormat(new Date(), 'mm/dd/yyyy "at" h:MM tt') + ".";
        var message = "New items have been added to the budget by " + firstName + ". Check out RAZBerry for latest changes!";

        // send the notification
        notifyUtil.Notify("RAZBerry", recipientsArray.join(", "), subject, message);
    }
}