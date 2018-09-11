var typesEnum = require("../enums/types.js");
var statusesEnum = require("../enums/statuses.js");
var dataUtil = require("../util/DataUtil.js");
var formatUtil = require("../util/FormatUtil.js");
var alphasort = require("alphanumeric-sort").compare;

const {Button, Composite, TextView, TextInput, Picker, AlertDialog, Page, ui} = require("tabris");

var types = typesEnum.GetLineItemTypes();
var statuses = statusesEnum.GetStatuses();

module.exports = class ItemDetails extends Composite {
    
    constructor(item, finished, properties) {
        super(properties);

        this._createUI(item, finished);
        this._applyLayout();
    }

    _createUI(item, finished) {
        // initialize the subcategories list
        var subcategoriesForChosenCategory = [{name: '', key: '-1', categoryKey: '-1'}];

        // Category
        new TextView({
            id: "categoryLabel",
            alignment: 'left',
            text: "Category:"
        }).appendTo(this);
        new Picker({
            id: "categoryPicker",
            itemCount: dataUtil.GetCategories().length,
            itemText: index => dataUtil.GetCategories()[index].categoryName
        })
        .on('select', ({index}) => {
            console.log("Category index chosen: " + index);
            if (typeof index !== "undefined") {
                var thisCategory = dataUtil.GetCategories()[index];
                subcategoriesForChosenCategory = dataUtil.BuildSubcategoriesForCategory(thisCategory.key);
                
                // set the subcategory picker with the data
                this.children('#subcategoryPicker').first().itemCount = subcategoriesForChosenCategory.length;
                this.children('#subcategoryPicker').first().itemText = index => subcategoriesForChosenCategory[index].name;
            }
        })
        .appendTo(this);

        // Subcategory
         new TextView({
            id: "subcategoryLabel",
            alignment: 'left',
            text: "Subcategory:"
        }).appendTo(this);
        new Picker({
            id: "subcategoryPicker",
            itemCount: subcategoriesForChosenCategory.length,
            itemText: index => subcategoriesForChosenCategory[index].name
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

        // Line Item Type
        new TextView({
            id: "typeLabel",
            alignment: 'left',
            text: "Type:"
        }).appendTo(this);
        new Picker({
            id: "typePicker",
            itemCount: types.length,
            itemText: index => types[index].name
        }).appendTo(this);
        
        // Payment Method
        new TextView({
            id: "pmLabel",
            alignment: "left",
            text: "Payment Method:"
        }).appendTo(this);
        new Picker({
            id: "pmPicker",
            itemCount: dataUtil.GetPaymentMethods().length,
            itemText: index => dataUtil.GetPaymentMethods()[index].paymentMethodName
        }).appendTo(this);

        // Status
        new TextView({
            id: "statusLabel",
            alignment: "left",
            text: "Status:"
        }).appendTo(this);
        new Picker({
            id: "statusPicker",
            itemCount: statuses.length,
            itemText: index => statuses[index].name
        }).appendTo(this);

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
            
            var thisItem = {
                category: (dataUtil.GetCategories()[this.children('#categoryPicker').first().selectionIndex]).key,
                subcategory: (subcategoriesForChosenCategory[this.children('#subcategoryPicker').first().selectionIndex]).key,
                type: types[this.children('#typePicker').first().selectionIndex].typeId,
                paymentMethod: (dataUtil.GetPaymentMethods()[this.children('#pmPicker').first().selectionIndex]).key,
                status: statuses[this.children('#statusPicker').first().selectionIndex].statusId
            };

            var pendingSubmission = JSON.parse(localStorage.getItem("itemsPendingSubmission"));

            // find the item in the list and replace it
            var itemIndex = pendingSubmission.findIndex(function (anItem) {
                return anItem.surrogateKey == item.surrogateKey;
            });
            
            // set the profile at the derived index
            pendingSubmission[itemIndex] = thisItem;

            // persist the updated profiles to localStorage
            localStorage.setItem("itemsPendingSubmission", JSON.stringify(pendingSubmission));

            // refresh the page once done
            finished();
        })
        .appendTo(this);

        // delete button to remove the item
        new Button({
            id: "deleteButton",
            text: "Delete",
            background: "#202020",
            textColor: "white"
        })
        .on('select', () => {
            new AlertDialog({
                message: "Confirm?",
                buttons: {ok: "Delete it!", cancel: "Cancel"}
            })
            .on({
                close: ({button}) => {
                    if (button == "ok") {
                        var itemProfiles = JSON.parse(localStorage.getItem("itemProfiles"));
                        var profileIndex = itemProfiles.findIndex(function (aProfile) {
                            return aProfile.profileName == profile.profileName;
                        });
                        
                        // remove the profile
                        itemProfiles.splice(profileIndex, 1);

                        // persist the profiles back to localStorage
                        localStorage.setItem("itemProfiles", JSON.stringify(itemProfiles));
                    }

                    // refresh the items selectors once done
                    finished();
                }
            })
            .open();
        })
        .appendTo(this);

        // set the field values by finding the indexes chosen and mapping them to the list values
        
        // set the category from the chosen profile
        var categoryIndexChosen = dataUtil.GetCategories().findIndex(function (aCategory) {
            return aCategory.key == item.category;
        });
        this.children('#categoryPicker').first().selectionIndex = categoryIndexChosen;            
        
        // set the subcategory based on the chosen category, if a key is specified
        if (item.subcategory != '-1' && item.category != '-1') {
            subcategoriesForChosenCategory = dataUtil.BuildSubcategoriesForCategory(item.category);
            var subcategoryIndexChosen = subcategoriesForChosenCategory.findIndex(function (aSubcategory) {
                return aSubcategory.key == item.subcategory;
            });

            // once the subcategory index is found, set the picker's state to the correct values
            this.children('#subcategoryPicker').first().itemCount = subcategoriesForChosenCategory.length;
            this.children('#subcategoryPicker').first().itemText = index => subcategoriesForChosenCategory[index].name;
            this.children('#subcategoryPicker').first().selectionIndex = subcategoryIndexChosen;
        }

        var typeIndexChosen = types.findIndex(function (aType) {
            return aType.typeId == item.type;
        });
        var pmIndexChosen = dataUtil.GetPaymentMethods().findIndex(function (aPaymentMethod) {
            return aPaymentMethod.key == item.paymentMethod;
        });
        var statusIndexChosen = statuses.findIndex(function (aStatus) {
            return aStatus.statusId == item.status;
        });

        this.children('#typePicker').first().selectionIndex = typeIndexChosen;
        this.children('#pmPicker').first().selectionIndex = pmIndexChosen;
        this.children('#statusPicker').first().selectionIndex = statusIndexChosen;
    }

    _applyLayout() {
        this.apply({
            '#categoryLabel': {left: 10, top: 0, width: 120},
            '#categoryPicker': {left: '#categoryLabel 10', right: 10, baseline: '#categoryLabel'},
            '#subcategoryLabel': {left: 10, top: '#categoryLabel 18', width: 120},
            '#subcategoryPicker': {left: '#subcategoryLabel 10', right: 10, baseline: '#subcategoryLabel'},
            '#typeLabel': {left: 10, top: '#subcategoryLabel 18', width: 120},
            '#typePicker': {left: '#typeLabel 10', right: 10, baseline: '#typeLabel'},
            '#pmLabel': {left: 10, top: '#typeLabel 18', width: 120},
            '#pmPicker': {left: '#pmLabel 10', right: 10, baseline: '#pmLabel'},
            '#statusLabel': {left: 10, top: '#pmLabel 18', width: 120},
            '#statusPicker': {left: '#statusLabel 10', right: 10, baseline: '#statusLabel'},
            '#saveButton': {centerY: 180, left: 10, right: 10, height: 62},
            '#deleteButton': {centerY: 250, left: 10, right: 10, height: 62}
        });
    }
}