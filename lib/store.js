/**
 * For create JSON file
 */

var fs = require('fs'),
    path = require('path'),
    j = path.join


var gmutil = require('./gmutil')

var _cwd = process.cwd()

var jsonFileName = 'gm-relevancy.json',
    jsonFilePath

var dataBase = {
  'name':'gm-relevancy',
  'time': (new Date()).getTime(),
  'img': {

  }
}
 

function _write(fpath){
    fs.writeFileSync(fpath, JSON.stringify(dataBase, null, 4))
}

function _push (imgFile, refFile) {
    // 如果已经存储，那么不再重复push
    if(_isInList(imgFile, refFile)) return true

    if(dataBase['img'][imgFile]){
        dataBase['img'][imgFile].push(refFile)
    }else {
        dataBase['img'][imgFile] = [refFile]
    }
}

function _check(fpath, relevancyDir, runStaticDir, componentsDir, handler){

    /*gmutil.warn(_cwd)
    gmutil.warn(fpath)
    gmutil.warn(runStaticDir)
    gmutil.warn(componentsDir)*/

    var componentsAbsPath = j(_cwd, componentsDir),
        imgRelPath = fpath.replace(componentsAbsPath, ''),
        imgAbsPath = j(_cwd, runStaticDir, imgRelPath)

    jsonFilePath = j(_cwd, relevancyDir, jsonFileName)
    
    if(fs.existsSync(jsonFilePath)) {
        dataBase = require(jsonFilePath)

        if(imgAbsPath in dataBase['img']){

            // console.log('hit!!')
            if(handler){
                dataBase['img'][imgAbsPath].forEach(item=>{

                    console.log('item: ', item)
                    
                    var pureExtName = path.extname(item).slice(1)
                    handler[pureExtName] && handler[pureExtName](item)
     
                })
            }

            return true
        }else {
            return false
        }
    }   

}


function _isInList(imgFile, refFile){
    var r

    return  (r = dataBase['img'][imgFile]) && r.indexOf(refFile) !== -1 ? true : false
}



function _save (imgFile, refFile, relevancyDir) {

    // update jsonFilePath
    jsonFilePath = j(_cwd, relevancyDir, jsonFileName)

    if(!fs.existsSync(jsonFilePath)){

        _push(imgFile, refFile)

        try{
            _write(jsonFilePath)
        }catch(err){
            gmutil.log('Write '+jsonFilePath+' Error: \n' + err, 'red')
        }
    }else {
        // update the file
        dataBase = require(jsonFilePath)

        _push(imgFile, refFile)

        _write(jsonFilePath)
        // console.log(dataBase) 
    }

}


exports.save = _save
exports.check = _check


