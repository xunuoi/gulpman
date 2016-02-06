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


function validateObj(obj){
    var a
    for(a in obj){
        if(obj.hasOwnProperty(a) && obj[a] === undefined) {
            delete obj[a]
        }
    }

    return obj
}


// source reg
var _reg = {
    link: new RegExp('<link\\s+[\\s\\S]*?>[\\s\\S]*?<*\\/*>*', 'gi'),
    img: new RegExp('<img\\s+[\\s\\S]*?>[\\s\\S]*?<*\\/*>*', 'gi'),

    href: new RegExp('\\s*(href)="+([\\s\\S]*?)"'),
    style:new RegExp('<style\\s*[\\s\\S]*?>[\\s\\S]*?<\\/style>', 'gi'),
    script: new RegExp('<script\\s*[\\s\\S]*?>[\\s\\S]*?<\\/script>', 'gi'),
    src: new RegExp('\\s*(src)="+([\\s\\S]*?)"'),

    tagMedia: new RegExp('<(img|link|source|input)\\s+[\\s\\S]*?>[\\s\\S]*?<*\\/*>*', 'gi'),

    closeTagMedia: new RegExp('<(script|iframe|frame|audio|video|object)\\s*[\\s\\S]*?>[\\s\\S]*?<\\/(script|iframe|frame|audio|video|object)>', 'gi')
    
}


exports.log = _log
exports.error = _error
exports.tip = _tip
exports.warn = _warn

exports.reg = _reg

// for rev replace
exports.byLongestUnreved = byLongestUnreved

exports.randomNum = randomNum

exports.pathInAssets = pathInAssets

exports.validateObj = validateObj
