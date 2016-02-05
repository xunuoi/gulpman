/**
 * FOR UTILS
 */


var colors = require('colors'),
    path = require('path'),
    j = path.join


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


/**
 * Returns a random number between min (inclusive) and max (exclusive)
 */
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function randomNum(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function byLongestUnreved(a, b) {
  return b.unreved.length - a.unreved.length;
}


function pathInAssets(_cwd, fpath, componentsDir, runStaticDir){
    var componentsAbsPath = j(_cwd, componentsDir),
    imgRelPath = fpath.replace(componentsAbsPath, ''),
    imgAbsPath = j(_cwd, runStaticDir, imgRelPath)

    return imgAbsPath
}


exports.log = _log
exports.error = _error
exports.tip = _tip
exports.warn = _warn

// for rev replace
exports.byLongestUnreved = byLongestUnreved

exports.randomNum = randomNum

exports.pathInAssets = pathInAssets
