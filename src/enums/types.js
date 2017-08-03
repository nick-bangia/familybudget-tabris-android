const TYPES = [
    {
        name: '',
        typeId: -1
    },
    {
        name: "Expense",
        typeId: 0
    },
    {
        name: "Allocation",
        typeId: 1
    },
    {
        name: "Adjustment",
        typeId: 2
    },
    {
        name: "Income",
        typeId: 3
    },
    {
        name: "Journal Entry",
        typeId: 4
    }
]

function getTypes() {
    
    return TYPES;
}

function getLineItemTypeFromID(id) {
    
    return TYPES.find(function (type) {
        return type.typeId == id;
    });
}

function getLineItemTypeFromName(name) {

    return TYPES.find(function (type) {
        return type.name == name;
    });
}

exports.GetLineItemTypes = getTypes;
exports.GetLineItemTypeFromID = getLineItemTypeFromID;
exports.GetLineItemTypeFromName = getLineItemTypeFromName;