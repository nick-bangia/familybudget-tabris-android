const {Page, Picker, TextView, TextInput, CheckBox, Button, ui} = require('tabris');
const PushToOptions = [{channel: "Nick", channelAlias: "iFoyA9"},
                       {channel: "Komal", channelAlias: "1QjzjR"}];


module.exports = class SettingsPage extends Page {
    
    constructor() {
        super(Object.assign({title: "Settings"}));
        this.on({
            appear: () => ui.find('#settingsAction').first().visible = false,
            disappear: () => ui.find('#settingsAction').first().visible = true
        });
        this._createUI();
        this._applyLayout();
    }

    _createUI() {
        this.append(
            new TextView({id: 'GeneralSectionLabel', markupEnabled: true, text: "<strong>General</strong>"}),
            new TextView({id: 'NameLabel', text: "Your Name:"}),
            new TextInput({id: 'NameInput', text: localStorage.getItem('firstName')}),
            new TextView({id: 'NotificationsSectionLabel', markupEnabled: true, text: '<strong>Push Notifications</strong>'}),
            new TextView({id: 'PushToLabel', text: "Push To:"}),
            new Picker({
                id: 'PushToPicker',
                itemCount:  PushToOptions.length,
                itemText: index => PushToOptions[index].channel,
                selectionIndex: PushToOptions.findIndex(function(option) {
                    return option.channelAlias == localStorage.getItem('PushToChannelAlias');
                })
            }),
            new CheckBox({
                id: 'AutoPushCheckbox',
                text: 'Push Automatically upon saving new items?',
                checked: localStorage.getItem('AutoPush') == "true" ? true : false
            }),
            new Button({
                id: 'SaveButton',
                text: 'Save Changes',
                background: '#007729',
                textColor: "white"
            }).on('select', () => {
                
                // save settings changes to memory
                localStorage.setItem('firstName', this.children('#NameInput').first().text);
                localStorage.setItem('PushToChannelAlias', PushToOptions[this.children('#PushToPicker').first().selectionIndex].channelAlias);
                localStorage.setItem('PushToChannelName', PushToOptions[this.children('#PushToPicker').first().selectionIndex].channel);
                localStorage.setItem('AutoPush', this.children('#AutoPushCheckbox').first().checked);

                window.plugins.toast.showShortCenter("Settings have been saved.");
            })
        );
    }

    _applyLayout() {
        this.apply({
            '#GeneralSectionLabel': {left: 10, top: 10, width: 120},
            '#NameLabel': {left: 18, top: '#GeneralSectionLabel 10', width: 112},
            '#NameInput': {left: '#NameLabel 10', right: 10, baseline: '#NameLabel'},
            '#NotificationsSectionLabel': {left: 10, top: '#NameLabel 20', width: 120},
            '#PushToLabel': {left: 18, top: '#NotificationsSectionLabel 10', width: 112},
            '#PushToPicker': {left: '#PushToLabel 10', right: 10, baseline: '#PushToLabel'},
            '#AutoPushCheckbox': {left: 18, top: '#PushToLabel 10', right: 10},
            '#SaveButton': {centerY: 250, left: 10, right: 10, height: 62}
        });
    }
};