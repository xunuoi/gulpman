/**
 * FOR BASE 64 UTILS
 */

var path = require('path'),
    j = path.join,
    fs = require('fs'),
    gutil = require('gulp-util'),
    through = require('through2')


var store = require('./store'),
    gmutil = require('./gmutil')


var bError = null

const PLUGIN_NAME = 'Base64'



function purify(str){
    return str.split('?')[0]
    // return str.replace(/\?_gm_inline/gm, '')
}


function parseSource(images, file, refType, content, opts, baseDir){

    var fileDir = path.dirname(file.relative)

    var status = true


    // gmutil.alert('debug: '+fileDir)

    images.forEach(function(item) {

        // remove url() in css
        var imageURL = item
            .replace(/\(|\)|\'/g, '')
            .replace(/^url/g, '')

        // 这里路经计算，需要后续优化
        // 现在相对路径计算繁琐了
        var pureFilePath;

        if(refType == 'css'){
            if(opts['isDevelop']){
                file.base = opts['components']
                fileDir = path.dirname(file.relative)
            }

            var pureFilePath = j(
                    file.cwd, 
                    baseDir, 
                    fileDir,
                    imageURL
                )

        // html or other source
        }else {

            var srcPath = purify(j(file.cwd, opts['views'], fileDir, imageURL))

            // 输出资源在HMTL是相对路径情况下
            if(opts['is_absolute'] === false){

                // develop模式下
                if(opts['isDevelop']){

                    var pureFilePath = srcPath

                }else {
                // publish 模式下

                    var dist_assets_path = j(file.cwd, opts['dist_assets']),
                        runtime_assets_path = j(file.cwd, baseDir)

                    var pureFilePath = srcPath.replace(dist_assets_path, runtime_assets_path)

                }

            // 绝对路径情况下，比如/static/home/main.css
            }else {

               var pureFilePath = j(baseDir, imageURL)
            }

        }


        // remove base64 params
        pureFilePath = purify(pureFilePath)


        // gmutil.warn('pureFilePath: \n\n\n'+pureFilePath+'\n\n')

        // check if exist
        try {
            var filepath = fs.realpathSync(pureFilePath);
        }catch(err){

            bError = err

            gmutil.error(err['message'])
            gmutil.error('\n*Check Your Component: '+fileDir)

            status = false

            return false
        }

        var extname = purify(path.extname(imageURL).slice(1))
        
        var imageContent = new Buffer(fs.readFileSync(filepath)).toString('base64')
        
        content = content.replace(
            item, 
            'data:image/' + 
            extname.toLowerCase() +
            ';base64,' + 
            imageContent
        )

        // generate json file of relevance
        store.save(filepath, gmutil.convertSource(file.path, refType))

        gmutil.log('*Convert to Base64: ' + filepath, 'green')
    })


    if(status) {
        return content
    }else {
        return false
    }
}



function toBase64(options) {
    var opts = options || {}
    var rule = opts.rule || /url\([^\)]+\)/g

    var refType = opts.type || 'css',
        baseDir = opts.baseDir || './'

    opts['dist_assets'] || (opts['dist_assets'] = '')


    return through.obj(function (file, enc, cb) {
        if (file.isNull()) {
            this.push(file)
            return cb()
        }

        if (file.isStream()) {
            this.emit('error', new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'))
            return cb()
        }

        var content = file.contents.toString()
        var images = content.match(rule)

        if(images){
            content = parseSource(images, file, refType,  content, opts, baseDir, this)

            // 如果出现错误返回了false 
            if(content === false){
                var errMes = 'File Not Exist'

                if(bError){
                    errMes = bError['message']
                }

                this.emit('error', new gutil.PluginError(PLUGIN_NAME, errMes))
            }else {
                file.contents = new Buffer(content)
            }

            
        }

        this.push(file)
        cb()
    })
}

module.exports = toBase64;