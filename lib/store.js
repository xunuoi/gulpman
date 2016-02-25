/**
 * For create JSON file
 */

var fs = require('fs'),
    path = require('path'),
    j = path.join


var gmutil = require('./gmutil')

var _cwd = process.cwd()

// var jsonFileName = 'gm-relevancy.json',
//     jsonFilePath

var dataBase = {
  'name':'gm-relevancy',
  'time': (new Date()).getTime(),
  'img': {},
  'sprite': {}
}


function initStore(db) {

    // check global namespace
    if(!global['gm_ns']) {
        global['gm_ns'] = {}
    }
    
    // update dataBase from global is existed
    if(global['gm_ns']['data_base']){
        dataBase = db || global['gm_ns']['data_base']

    }else{
        
        global['gm_ns']['data_base'] = db || dataBase

    }

}
 

function _write(fpath){
    fs.writeFileSync(fpath, JSON.stringify(dataBase, null, 4))
}

function _push (imgFile, refFile, dbType) {
    // 如果已经存储，那么不再重复push
    if(_isInList(imgFile, refFile, dbType)) return true

    if(dataBase[dbType][imgFile]){
        dataBase[dbType][imgFile].push(refFile)
    }else {
        dataBase[dbType][imgFile] = [refFile]
    }
}

function _check(imgAbsPath, handler, dbType, handlerType){

    // gmutil.alert('DB: \n'+JSON.stringify(global['gm_ns']['data_base']))

    var dbType = dbType || 'img'

    if(imgAbsPath in dataBase[dbType]){

        if(handler){
            dataBase[dbType][imgAbsPath].forEach(item=>{

                gmutil.warn('*Relevancy Process: '+item)       

                // the handler default as file type
                var hfn = handlerType || path.extname(item).slice(1)

                handler[hfn] && handler[hfn](item)
 
            })
        }

        return true

    }else {

        return false
    }


}


function _isInList(imgFile, refFile, dbType){
    var r

    return  (r = dataBase[dbType][imgFile]) && r.indexOf(refFile) !== -1 ? true : false
}



function _save (imgFile, refFile, dbType) {
    var dbType = dbType || 'img'

    // gmutil.alert(imgFile+' :\n'+refFile)
    if(typeof imgFile == 'string'){
        // just save in memory now, not write in file
        return _push(imgFile, refFile, dbType)
    }else if(gmutil.isArray(imgFile)){
        imgFile.forEach((e,i)=>{
            _push(e, refFile, dbType)
        })

        return true;
    }else {
        gmutil.error("*Relevancy Store Error:\n")
        throw Error('Unknown Type: '+imgFile)
    }

}


// init store
initStore()


// api
exports.save = _save
exports.check = _check


