
/**
 * FOR CDN PREFIX CONFIG
 *
 * FIX gulp-rev-all and revReplace about `prefix`
 */

/**
 * Another Proxy code in revReplace.js,
 * include random url of list and function
 */


var gmutil = require('./gmutil')


function proxyPrefix(obj){
    // fix prefix options for gulp-rev-all
    // 注意： 这了可能会干预到rev-replace里的变量
    
    obj['cdn_prefix'] = obj['cdn_prefix'] || ''
    obj['_prefix'] = obj['cdn_prefix']


    // fix array
    if(obj['cdn_prefix'] instanceof Array){

        // console.log('Array: \n', obj['cdn_prefix'])

        function _getRandPrefixFromList(){
            return obj['_prefix'][gmutil.randomNum(0, obj['_prefix'].length-1)]
        }

        // rewrite replace of array
        obj['cdn_prefix'].replace = function(a, b){

            var p = _getRandPrefixFromList().replace(a, b)

            return p
        }

        // rewrite toString of array
        obj['cdn_prefix'].toString = function(){

            return _getRandPrefixFromList()
        }


    }else if(obj['cdn_prefix'] instanceof Function){

        // !! only for gulp-rev-all
        obj['transformPath'] = function (rev, source, file) {

            return obj['_prefix'](source, rev, file)+rev

            // on the remote server, image files are served from `/images`
            // return rev.replace('/img', '/images') 
        }


    }else if(typeof obj['cdn_prefix'] == 'string'){

        // no handle
        // obj['_all_prefix'].add(obj['cdn_prefix'])

    }else {
        throw Error('Unknown Type: '+ (typeof obj['cdn_prefix']))
    }


    return obj

}


exports.proxyPrefix = proxyPrefix