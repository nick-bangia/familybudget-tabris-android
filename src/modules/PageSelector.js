var pages = require("../config/pageConfig.json");

const {Composite, TextView, Page, ui} = require('tabris');

module.exports = class PageSelector extends Composite {
        
    constructor(openNewPageCallback, properties) {
        super(properties);
        this._createUI();
        this._applyLayout();
        this._applyStyles();
        this.openNewPage = openNewPageCallback;
        
        this._open(
            new Page({
                title: pages[0].pageTitle
            })
        );
    }

    _createUI() {
        this.append(
            pages.map(({pageTitle}) => 
                new Composite({class: 'pageEntry', highlightOnTouch: true}).append(
                    new TextView({class: 'titleLabel', text: pageTitle})
                ).on('tap', () => this._open(new Page({
                    title: pageTitle
                })))
            )
        );
    }

    _open(page) {
        let navigationView = ui.contentView.find('NavigationView').first();
        navigationView.pageAnimation = 'none';
        ui.drawer.close();
        navigationView.pages().dispose();
        page.appendTo(navigationView);
        navigationView.pageAnimation = 'default';

        // open the new page using the navigation object
        this.openNewPage(page);
    }

    _applyLayout() {
        this.apply({
        '.pageEntry': {left: 0, top: 'prev()', right: 0, height: device.platform === 'iOS' ? 40 : 48},
        '.titleLabel': {left: 15, centerY: 0}
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
};