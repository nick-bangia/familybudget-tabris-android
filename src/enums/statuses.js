const STATUSES = [
    {
        name: '',
        statusId: -1
    },
    {
        name: "Reconciled",
        statusId: 0
    },
    {
        name: "Pending",
        statusId: 1
    }
]

function getStatuses() {
    
    return STATUSES;
}

function getStatusFromID(id) {
    
    return STATUSES.find(function (status) {
        return type.statusId == id;
    });
}

function getStatusFromName(name) {

    return STATUSES.find(function (status) {
        return status.name == name;
    });
}

exports.GetStatuses = getStatuses;
exports.GetStatusFromID = getStatusFromID;
exports.GetStatusFromName = getStatusFromName;