// extend the number prototype here
Number.prototype.format = function(n, x) {
    var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
    return this.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$&,');
};

function formatCurrency(number) {

    // get number into a working variable
    var numberToFormat = number;

    // given a number, format it as USD currency
    // start with dollar sign
    var formattedCurrency = "$";

    // check if negative, and if so, get absolute value and raise the isNegative flag
    var isNegative = false;
    if (number < 0) {
        isNegative = true;
        numberToFormat = -1 * numberToFormat;
    }

    // if negative, add a starting parantheses
    if (isNegative) {
        formattedCurrency += "(";
    }

    // format the number with proper commas & decimals
    formattedCurrency += numberToFormat.format(2);

    // add a second parathenses if negative
    if (isNegative) {
        formattedCurrency += ")";
    }

    return formattedCurrency;
}

exports.FormatCurrency = formatCurrency;