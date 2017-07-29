var ItemProfile = require('./ItemProfile.js');
var dataUtil = require('../util/DataUtil.js');

const {Button, Composite, TextView, Page, ui} = require('tabris');

module.exports = class ItemProfileSelector extends Composite {

    constructor(refreshSelector, properties) {
        super(properties);
        this._createUI(refreshSelector);
        this._applyLayout();
        this._applyStyles();
    }

    _createUI(refreshSelector) {
        // load profiles from local storage
        var profiles = JSON.parse(localStorage.getItem("itemProfiles"));

        if (profiles) {
            this.append(
                profiles.map(({profileName, type, paymentMethod, status}) => 
                    new Composite({class: 'profileEntry', highlightOnTouch: true}).append(
                        new TextView({class: 'titleLabel', text: profileName})
                    ).on('tap', () => this._open(
                        refreshSelector,
                        new Page({
                            title: profileName
                        }),
                        {profileName: profileName, type: type, paymentMethod: paymentMethod, status: status}
                    ))
                )
            );
        }

        this.append(
            new Button({
                id: 'AddNewProfileButton',
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

    _applyLayout() {
        this.apply({
        '.profileEntry': {left: 0, top: 'prev()', right: 0, height: device.platform === 'iOS' ? 40 : 48},
        '.titleLabel': {left: 10, centerY: 0},
        '#AddNewProfileButton': {centerX: 0, top: 'prev() 18'}
        });
    }

    _applyStyles() {
        this.apply({
        '.titleLabel': {
            font: device.platform === 'iOS' ? '17px .HelveticaNeueInterface-Regular' : 'medium 20px',
            textColor: device.platform === 'iOS' ? 'rgb(22, 126, 251)' : '#212121'
        }
        });
    }
}
