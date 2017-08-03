var typesEnum = require("../enums/types.js");
var statusesEnum = require("../enums/statuses.js");
var dataUtil = require("../util/DataUtil.js");

const {Button, Composite, TextView, TextInput, Picker, AlertDialog, Page, ui} = require("tabris");

var types = typesEnum.GetLineItemTypes();
var statuses = statusesEnum.GetStatuses();

module.exports = class ItemProfile extends Composite {
    
    constructor(profile, refreshSelector, properties) {
        super(properties);
        var isNew = typeof profile === "undefined";
        this._createUI(profile, refreshSelector, isNew);
        this._applyLayout(isNew);
    }

    _buildSubcategoriesForCategory(categoryKey) {
        var allActiveSubcategories = dataUtil.GetSubcategories();
        var subcategoriesForCategory = [];

        // loop through subcategories and set up the subcategory picker with this categories members
        for (var i = 0; i < allActiveSubcategories.length; i++) {
            if (allActiveSubcategories[i].categoryKey == categoryKey) {
                subcategoriesForCategory.push(allActiveSubcategories[i]);
            }
        }

        return subcategoriesForCategory;
    }

    _createUI(profile, refreshSelector, isNew) {
        // initialize the subcategories list
        var subcategoriesForChosenCategory = [{name: '', key: '-1', categoryKey: '-1'}];
        
        // create the UI elements to edit or create a new Item Profile
        if (isNew) {
            // Item Profile Name
            new TextView({
                id: 'profileNameLabel',
                alignment: 'left',
                text: 'Profile Name:'
            }).appendTo(this);
            new TextInput({
                id: 'profileNameInput',
                message: 'Choose a name'
            }).appendTo(this);
        }

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
                subcategoriesForChosenCategory = this._buildSubcategoriesForCategory(thisCategory.key);
                
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

        // save button
        new Button({
            id: "saveButton",
            text: "Save",
            background: '#007729',
            textColor: "white"
        })
        .on('select', () => {
            
            var thisProfile = {
                category: (dataUtil.GetCategories()[this.children('#categoryPicker').first().selectionIndex]).key,
                subcategory: (subcategoriesForChosenCategory[this.children('#subcategoryPicker').first().selectionIndex]).key,
                type: types[this.children('#typePicker').first().selectionIndex].typeId,
                paymentMethod: (dataUtil.GetPaymentMethods()[this.children('#pmPicker').first().selectionIndex]).key,
                status: statuses[this.children('#statusPicker').first().selectionIndex].statusId
            };

            var itemProfiles = JSON.parse(localStorage.getItem("itemProfiles"));

            if (isNew) {
                // if the profile is new, save the name, and 
                // create the object and add it to the list in storage
                thisProfile.profileName = this.children('#profileNameInput').first().text;

                if (itemProfiles) {
                    itemProfiles.push(thisProfile);
                } else {
                    // no profiles exist yet, so create a new list and push it
                    itemProfiles = [thisProfile];
                }
            } else {
                // if the profile already exists, find it in the list and replace it
                var profileIndex = itemProfiles.findIndex(function (aProfile) {
                    return aProfile.profileName == profile.profileName;
                });
                
                // set the name of the profile
                thisProfile.profileName = profile.profileName;
                
                // set the profile at the derived index
                itemProfiles[profileIndex] = thisProfile;
            }

            // persist the updated profiles to localStorage
            localStorage.setItem("itemProfiles", JSON.stringify(itemProfiles));

            // refresh the item selectors once done
            refreshSelector();
        })
        .appendTo(this);

        // if not a new profile, add the delete button and set the values
        if (!isNew) {
            // if not new, show delete button
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

                        // refresh the items selectorsonce done
                        refreshSelector();
                    }
                })
                .open();
            })
            .appendTo(this);

            // set the field values by finding the indexes chosen and mapping them to the list values
            // set the category from the chosen profile
            var categoryIndexChosen = dataUtil.GetCategories().findIndex(function (aCategory) {
                return aCategory.key == profile.category;
            });
            this.children('#categoryPicker').first().selectionIndex = categoryIndexChosen;            
            
            // set the subcategory based on the chosen category, if a key is specified
            if (profile.subcategory != '-1' && profile.category != '-1') {
                subcategoriesForChosenCategory = this._buildSubcategoriesForCategory(profile.category);
                var subcategoryIndexChosen = subcategoriesForChosenCategory.findIndex(function (aSubcategory) {
                    return aSubcategory.key == profile.subcategory;
                });

                // once the subcategory index is found, set the picker's state to the correct values
                this.children('#subcategoryPicker').first().itemCount = subcategoriesForChosenCategory.length;
                this.children('#subcategoryPicker').first().itemText = index => subcategoriesForChosenCategory[index].name;
                this.children('#subcategoryPicker').first().selectionIndex = subcategoryIndexChosen;
            }

            var typeIndexChosen = types.findIndex(function (aType) {
                return aType.typeId == profile.type;
            });
            var pmIndexChosen = dataUtil.GetPaymentMethods().findIndex(function (aPaymentMethod) {
                return aPaymentMethod.key == profile.paymentMethod;
            });
            var statusIndexChosen = statuses.findIndex(function (aStatus) {
                return aStatus.statusId == profile.status;
            });

            this.children('#typePicker').first().selectionIndex = typeIndexChosen;
            this.children('#pmPicker').first().selectionIndex = pmIndexChosen;
            this.children('#statusPicker').first().selectionIndex = statusIndexChosen;
        }
    }

    _applyLayout(isNew) {
        this.apply({
            '#profileNameLabel': {left: 10, top: 0, width: 120},
            '#profileNameInput': {left: '#profileNameLabel 10', right: 10, baseline: '#profileNameLabel'},
            '#categoryLabel': {left: 10, top: '#profileNameLabel 18', width: 120},
            '#categoryPicker': {left: '#categoryLabel 10', right: 10, baseline: '#categoryLabel'},
            '#subcategoryLabel': {left: 10, top: '#categoryLabel 18', width: 120},
            '#subcategoryPicker': {left: '#subcategoryLabel 10', right: 10, baseline: '#subcategoryLabel'},
            '#typeLabel': {left: 10, top: '#subcategoryLabel 18', width: 120},
            '#typePicker': {left: '#typeLabel 10', right: 10, baseline: '#typeLabel'},
            '#pmLabel': {left: 10, top: '#typeLabel 18', width: 120},
            '#pmPicker': {left: '#pmLabel 10', right: 10, baseline: '#pmLabel'},
            '#statusLabel': {left: 10, top: '#pmLabel 18', width: 120},
            '#statusPicker': {left: '#statusLabel 10', right: 10, baseline: '#statusLabel'}
        });

        if (isNew) {
            this.apply({
                '#saveButton': {centerX: 0, top: '#statusLabel 18'}
            });
        } else {
            this.apply({
                '#saveButton': {centerX: -50,  top: '#statusLabel 18'},
                '#deleteButton': {centerX: 50,  top: '#statusLabel 18'}
            });
        }
    }
}