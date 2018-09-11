var ItemDetails = require('./ItemDetails.js');
var dataUtil = require('../util/DataUtil.js');

const {Button, Composite, TextView, Page, CollectionView, ui} = require('tabris');

module.exports = class ReviewItems extends Composite {

    constructor(refreshPage, properties) {
        super(properties);
        this._createUI(refreshPage);
    }

    _createUI(refreshPage) {
        // load pending items from local storage
        var itemsPendingSubmission = JSON.parse(localStorage.getItem("itemsPendingSubmission"));

        // append the add new profile button
        this.append(
            new Button({
                id: 'SubmitButton',
                centerY: 250, left: 10, right: 10, height: 62,
                text: 'Submit',
                background: '#007729',
                textColor: 'white'
            })
            .on('select', () => this._submit())
        );
        
        // if profiles exist and have length greater than 0, create the collection
        // view to display them
        if (itemsPendingSubmission && itemsPendingSubmission.length != 0) {
            this.append(
                new CollectionView({
                    id: "pendingCollection",
                    left: 0, top: 5, bottom: '#SubmitButton -10', right: 0,
                    refreshEnabled: false,
                    cellHeight: 60,
                    cellType: 'normal',
                    itemCount: itemsPendingSubmission.length,
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
                                refreshPage,
                                new Page({
                                    title: 'Edit Item Details'
                                }),
                                {
                                 subcategory: view.item.subcategoryKey,
                                 amount: view.item.amount,
                                 description: view.item.description,
                                 credit: view.item.
                                 type: view.item.type, 
                                 paymentMethod: view.item.paymentMethod, 
                                 status: view.item.status}
                            )    
                        })
                        .appendTo(cell);

                        new TextView({
                            id: 'itemDescText',
                            markupEnabled: true,
                            top: 4, bottom: 4, left: 10,
                            textColor: '#000000',
                            font: '18px'
                        }).appendTo(container);
                        
                        new TextView({
                            id: 'itemAmountText',
                            markupEnabled: true,
                            top: 4, right: 16,
                            alignment: 'right',
                            markupEnabled: true,
                            textColor: '#000000',
                            font: '18px'
                        }).appendTo(container);

                        

                        return cell;
                    },
                    updateCell: (view, index) => {
                        let item = itemsPendingSubmission[index];
                        view.find('#container').first().item = item;
                        view.find('#itemDescText').set('text', "<strong>" + item.description + "</strong>");
                    }
                })
            );
        }
    }

    _open(refreshPage, page, item) {
        // check status of data and if any are not available, notify
        // the user
        if (dataUtil.GetAllDataLoaded()) {
            let navigationView = ui.contentView.find('NavigationView').first();
            navigationView.pageAnimation = 'none';
            page.appendTo(navigationView);
            navigationView.pageAnimation = 'default'; 

            // create the Item Details and append it to the page
            new ItemDetails(
                item,
                refreshPage,
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
