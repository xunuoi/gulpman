/**
 * FOR BASE 64 UTILS
 */

var path = require('path'),
    j = path.join,
    fs = require('fs'),

    through = require('through2')


var store = require('./store'),
    gmutil = require('./gmutil')


function purify(str){
    return str.replace(/\?base64\=true/g, '')
}


function parseSource(images, file, refType, content, opts, baseDir, relevancyDir){

    var fileDir = path.dirname(file.relative)

    images.forEach(function(item) {
        // remove url() in css
        var imageURL = item
            .replace(/\(|\)|\'/g, '')
            .replace(/^url/g, '')

        // 这里路经计算，需要后续优化
        // 现在相对路径计算繁琐了
        var pureFilePath;

        // console.log('\n\n')
        // gmutil.error(refType)
        // console.log(file.cwd)
        // console.log(baseDir)
        // console.log(fileDir)
        // console.log(file.relative)
        // console.log(file.path)
        // console.log(imageURL)
        // // console.log(opts['dist_assets'])
        // // console.log(opts['components'])
        // console.log('\n\n')

        // var 

        // if in absolute ===========        
        

        // end if ===================

        if(refType == 'css'){
            var pureFilePath = j(
                    file.cwd, 
                    baseDir, 
                    fileDir,
                    imageURL
                )

        // html or other source
        }else {

            var srcPath = purify(j(file.cwd, opts['views'], fileDir, imageURL))

            // console.log('srcPath: ', srcPath)
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

        /**
         * debug
         * 解决相对路径时候，文件找不到的问题，需要动态计算真实路径，从而realpathSync不会报错
         */

        var filepath = fs.realpathSync(pureFilePath);

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
        store.save(filepath, j(file.base, file.relative), relevancyDir)

        gmutil.log('\n*File convert to Base64: ' + filepath+'\n', 'green')
    })

    return content
}



function toBase64(options) {
    var opts = options || {}
    var rule = opts.rule || /url\([^\)]+\)/g

    var refType = opts.type || 'css'

    var baseDir = opts.baseDir || './',
        relevancyDir = opts.relevancyDir || opts.baseDir


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
            content = parseSource(images, file, refType,  content, opts, baseDir, relevancyDir)
            file.contents = new Buffer(content)
        }

        this.push(file)
        cb()
    })
}

module.exports = toBase64;