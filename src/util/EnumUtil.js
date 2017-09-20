function getQuarterIdFromMonth(monthId) {
    
    var quarterId = 1;
    
    switch (monthId) {
        case 1:
        case 2:
        case 3:
        quarterId = 1;
        break;
        case 4:
        case 5:
        case 6:
        quarterId = 2;
        break;
        case 7:
        case 8:
        case 9:
        quarterId = 3;
        break;
        case 10:
        case 11:
        case 12:
        quarterId = 4;
        break;
    }

    return quarterId;
}

exports.GetQuarterForMonth = getQuarterIdFromMonth;