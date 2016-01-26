var path = require('path');
var fs = require('fs');
var through = require('through2');

function toBase64(options) {
    var opts = options || {};
    var rule = opts.rule || /url\([^\)]+\)/g;
    var initFileType = opts.type || 'css';
    var baseDir = opts.baseDir || '.';

    return through.obj(function (file, enc, cb) {
        if (file.isNull()) {
            this.push(file);
            return cb();
        }

        if (file.isStream()) {
            this.emit('error', new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'));
            return cb();
        }

        var content = file.contents.toString();
        var images = content.match(rule);


        // console.log(file.basename)
        // console.log(file.base)
        // console.log(file.relative)

        
        if(images){

            var fileDir = path.dirname(file.relative)


            images.forEach(function(item) {
                imageURL = item.replace(/\(|\)|\'/g, '');
                imageURL = imageURL.replace(/^url/g, '');

                // 这里路经计算，需要后续优化
                // 现在相对路径计算繁琐了
                
                var route = path.join(baseDir, imageURL)


                if(opts['type'] == 'css'){

                    if(opts['isAbsolutePath']){
                        route = path.join(baseDir, fileDir, imageURL);

                        var pureFilePath = path.join(file.cwd, route)

                    }else {
                        var pureFilePath = path.join(file.cwd, baseDir, 
                            fileDir,
                            imageURL)
                    }

                // html or other source
                }else {

                    if(!opts['isAbsolutePath']){

                        var relPath1 = path.join(file.base, fileDir);

                        var pureFilePath = path.join(relPath1, '../', route)

                    }else {

                       var pureFilePath = route 
                    }

                }


                // remove base64 params
                pureFilePath = pureFilePath.replace(/\?base64\=true/g, '')


                // console.log('\n\n\n'+pureFilePath+'\n\n')

                /**
                 * debug
                 * 解决相对路径时候，文件找不到的问题，需要动态计算真实路径，从而realpathSync不会报错
                 */

                var filepath = fs.realpathSync(pureFilePath);


                var extname = path.extname(imageURL).slice(1);
                var imageContent = new Buffer(fs.readFileSync(filepath)).toString('base64');

                /*if (initFileType === 'css') {
                    content = content.replace(item, 'url(\'data:image/' + extname.toLowerCase() + ';base64,' + imageContent + '\')');
                }*/
                
                content = content.replace(
                    item, 
                    'data:image/' + 
                    extname.toLowerCase() +
                    ';base64,' + 
                    imageContent
                )

                console.log('*File convert to Base64: ' + filepath)
                
            });

            file.contents = new Buffer(content);

        }
        this.push(file);

        cb();
    })
}

module.exports = toBase64;