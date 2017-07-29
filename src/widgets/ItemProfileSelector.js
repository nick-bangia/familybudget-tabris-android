var ItemProfile = require('./ItemProfile.js');
var dataUtil = require('../util/DataUtil.js');

const {Button, Composite, TextView, Page, CollectionView, ui} = require('tabris');

module.exports = class ItemProfileSelector extends Composite {

    constructor(refreshSelector, properties) {
        super(properties);
        this._createUI(refreshSelector);
    }

    _createUI(refreshSelector) {
        // load profiles from local storage
        var profiles = JSON.parse(localStorage.getItem("itemProfiles"));

        // append the add new profile button
        this.append(
            new Button({
                id: 'AddNewProfileButton',
                top: '5', centerX: 0,
                text: 'Add New Profile',
                background: '#007729',
                textColor: 'white'
            })
            .on('select', () => this._open(
                refreshSelector,
                new Page({
                    title: "New Profile"
                })
            ))
        );
        
        // if profiles exist and have length greater than 0, create the collection
        // view to display them
        if (profiles && profiles.length != 0) {
            this.append(
                new CollectionView({
                    id: "profileCollection",
                    left: 0, top: '#AddNewProfileButton 5', right: 0, bottom: 0,
                    refreshEnabled: false,
                    cellHeight: 60,
                    cellType: 'normal',
                    itemCount: profiles.length,
                    createCell: () => {
                        let cell = new Composite();
                        let container = new Composite({
                            id: 'container',
                            left: 16, right: 16, top: 8, bottom: 8,
                            cornerRadius: 2,
                            elevation: 2,
                            background: 'white',
                            highlightOnTouch: true
                        })
                        .on('tap', ({target: view}) => {
                            this._open(
                                refreshSelector,
                                new Page({
                                    title: view.item.profileName
                                }),
                                {profileName: view.item.profileName, 
                                 type: view.item.type, 
                                 paymentMethod: view.item.paymentMethod, 
                                 status: view.item.status}
                            )    
                        })
                        .appendTo(cell);

                        new TextView({
                            id: 'itemNameText',
                            markupEnabled: true,
                            top: 4, bottom: 4, left: 10,
                            textColor: '#000000',
                            font: '18px'
                        }).appendTo(container);

                        return cell;
                    },
                    updateCell: (view, index) => {
                        let item = profiles[index];
                        view.find('#container').first().item = item;
                        view.find('#itemNameText').set('text', "<strong>" + item.profileName + "</strong>");
                    }
                })
            );
        }
    }

    _open(refreshSelector, page, profile) {
        // check status of data and if any are not available, notify
        // the user
        if (dataUtil.GetAllDataLoaded()) {
            let navigationView = ui.contentView.find('NavigationView').first();
            navigationView.pageAnimation = 'none';
            page.appendTo(navigationView);
            navigationView.pageAnimation = 'default'; 

            // create the Item Profile and append it to the page
            new ItemProfile(
                profile,
                refreshSelector,
                { left: 0, top: 16, right: 0, bottom: 0 }
            ).appendTo(page);
        
        } else {
            // show a dialog informing user that data hasn't been fully
            // loaded yet. Give option to force a refresh.
            new AlertDialog({
                message: "Required data has not been loaded yet. Try again in a few seconds.",
                buttons: {ok: "OK", neutral: "Force Refresh"}
            }).on({
                closeNeutral: () => dataUtil.LoadData()
            }).open();
        }
    }
}
