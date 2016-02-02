/**
 * FOR UTILS
 */


var colors = require('colors')


function _log (str, color) {

    str += ''

    var color = color || 'blue'

    console.log(str[color])
}

function _error (str){

    return _log(str, 'red')
}

function _tip (str){

    return _log(str, 'green')
}

function _warn (str){

    return _log(str, 'yellow')
}


exports.log = _log
exports.error = _error
exports.tip = _tip
exports.warn = _warn
