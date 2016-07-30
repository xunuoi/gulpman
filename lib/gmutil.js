/**
 * FOR UTILS
 */

'use strict'


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

function _alert(str) {
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

function isArray(o) { 
    return Object.prototype.toString.call(o) === '[object Array]';  
}


function convertSource(rawSource, refType){
    let tarType

    if(refType == 'css'){
        tarType = 'scss'
    }

    var repReg = new RegExp('\\.'+refType+'$', 'g'),
        rsList = []

    if(!rawSource.match(repReg)) {

        return rawSource

    }

    if(typeof tarType == 'string'){
        return rawSource.replace(repReg, '.'+tarType)

    }else {
        return rawSource
    }

}


function isUrl(urlType, str){
    var _d = {
        'absolute': /^\//g,
        'http': /^http(s)?\:/g,
        'dataURL': /^data\:/g,
    }

    var t = _d[urlType]

    if(urlType == 'relative'){
        return !isUrl('absolute', str) &&
                !isUrl('http', str) &&
                !isUrl('dataURL', str)
    }

    if(!t){
        throw Error('Unknow Type: '+t)
    }

    return str.match(_d[urlType])
}

function joinUrl (a, b){
    if(!b.match(/\/$/g)) {
        b = b + '/'
    }

    if(!a.match(/\/$/g) && !b.match(/^\//g)) {
        return a + '/' + b;
    }else if(a.match(/\/$/g) && b.match(/^\//g)){

        return a.replace(/\/$/g, '') + b;
    }else{
        return a + b;
    }
    
}


function replaceBuildBlock(content, srcPrefix) {

    var startReg = /<!--\s*build:(\w+)(?:(?:\(([^\)]+?)\))?\s+(\/?([^\s]+?))?)?\s*-->/gim;
    var endReg = /<!--\s*endbuild\s*-->/gim;


    var sections = content.split(endReg)

    sections.forEach((e, i)=>{
        var block

        if( (block = e.match(startReg)) && (block = block[0])){

            var section = e.split(startReg)
            // var block = e.match(startReg)[0]

            var newOutPath = j(srcPrefix, section[4])

            // _alert('Usemin Build: '+newOutPath)

            // section[2]: alternative search path
            // section[3]: nameInHTML: section[3]
            // section[4]: relative out path

            content = content.replace(block, '<!-- build:' + section[1] + (section[2] ? section[2] : ' ') + newOutPath + ' -->')

        }
    })


    return content  

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

    closeTagMedia: new RegExp('<(script|iframe|frame|audio|video|object)\\s*[\\s\\S]*?>[\\s\\S]*?<\\/(script|iframe|frame|audio|video|object)>', 'gi'),

    useminBuild: new RegExp('<\\!\\-\\-\\s+build\\:\\w+\\s+([\\w\\.\\/\\-\\?\\=&]+)\\s+\\-\\->', 'gm')
    
}

// log
exports.log = _log
exports.error = _error
exports.alert = _alert
exports.tip = _tip
exports.warn = _warn

exports.reg = _reg

// for rev replace
exports.byLongestUnreved = byLongestUnreved
exports.joinUrl = joinUrl
// utils
exports.randomNum = randomNum
exports.isArray = isArray
exports.pathInAssets = pathInAssets
exports.validateObj = validateObj
exports.convertSource =  convertSource

// for usemin build
exports.replaceBuildBlock = replaceBuildBlock

exports.isUrl = isUrl
