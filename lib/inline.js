/**
 * Created by Rodey on 2015/11/5.
 */

var fs          = require('fs'),
    path        = require('path'),
    through2    = require('through2'),
    uglifycss   = require('uglifycss'),
    jsmin       = require('jsmin2'),
    PluginError = require('gulp-util').PluginError,

    gmutil      = require('./gmutil'),
    store       =  require('./store')


var PLUGIN_NAME = 'gulp-html-inline';

var linkRegx    = new RegExp('<link\\s+[\\s\\S]*?>[\\s\\S]*?<*\\/*>*', 'gi'),
    hrefRegx    = new RegExp('\\s*(href)="+([\\s\\S]*?)"'),
    styleRegx   = new RegExp('<style\\s*[\\s\\S]*?>[\\s\\S]*?<\\/style>', 'gi'),
    jsRegx      = new RegExp('<script\\s+[\\s\\S]*?>[\\s\\S]*?<\\/script>', 'gi'),
    scriptRegx  = new RegExp('<script\\s*[\\s\\S]*?>[\\s\\S]*?<\\/script>', 'gi'),
    srcRegx     = new RegExp('\\s*(src)="+([\\s\\S]*?)"');

var joint = function(tag, content){
    return '<'+ tag +'>' + content + '</'+ tag +'>';
};

// add for gulpman
var _file;

/**
 * 获取get模式下url中的指定参数值
 * @param name      参数名
 * @param url       传入的url地址
 * @returns {*}
 */
var getParams = function(name, url) {
    var reg = new RegExp('(^|&)' + name + '=?([^&]*)(&|$)', 'i'), search = '';
    if(url && url !== ''){
        search = (url.split('?')[1] || '').match(reg);
    }else{
        search = window.location.search.substr(1).match(reg);
    }
    if(search && search[0].indexOf(name) !== -1) {
        return search[2] ? decodeURI(search[2]) : null;
    }
};

//压缩内联css代码 | js脚本
var miniInline = function(content, type, options){
    var isMinifyCss = options && !!options.minifyCss,
        isMinifyJs  = options && !!options.minifyJs,
        ignore      = options['ignore'] || 'ignore',
        basePath    = options['basePath'] || '',
        queryKey    = options['queryKey'] || '_gm_inline',
        queryRegx   = new RegExp('&*'+ queryKey +'[=|&]?', 'i'),
        code = content,
        tags;

    tags = content.match(/<[\s\S]*?<*\/*[\s\S]*?>/gi);

    if(tags && tags[0] && tags[0].indexOf(ignore) !== -1)
        return content;

    if('css' === type){
        if(!isMinifyCss) return content;
        code = uglifycss.processString(content, options);
    }
    else if('js' === type){
        if(!isMinifyJs) return content;

        /**
         * FIX BUGS FOR replace
         */
        // gmutil.alert('content: \n'+content)
        // gmutil.alert('opts: \n'+JSON.stringify(options))

        var pt = /(?=['"]?)([\w\/\-\?\&\=]*?\.js)(?=['"]?)/gm,
            item

        // 如果没有标记inline，那么不处理
        if((item = content.match(pt)) && (item = item[0])){
            if(!item.match(queryRegx)) return content
        }

        // gmutil.alert(jsmin(content, options).code)
        code = jsmin(content, options).code.replace(/\n*\t*/gi, '');
    }
    return code;
};

//replace callback src | href
var replaceCallback = function(sourceRegx, match, parentFile, type, options){

    var ms = sourceRegx.exec(match),
        code = '',
        query,
        isMinifyCss = options && !!options.minifyCss,
        isMinifyJs  = options && !!options.minifyJs,
        ignore      = options['ignore'] || 'ignore',
        basePath    = options['basePath'] || '',
        queryKey    = options['queryKey'] || '_gm_inline',
        queryRegx   = new RegExp('&*'+ queryKey +'[=|&]?', 'i');

    if(!ms || !ms[2] || '' === ms[2]){
        return miniInline(match, type, options);
    }
    var attr = ms[1] || '',
        href = ms[2] || '';


    if(match.indexOf(ignore) !== -1)
            return match.replace(queryRegx, '');

    //在url地址上加上 _gm_inline_字段就可以直接嵌入网页
    query = getParams(queryKey, href);

    if(query === undefined){
        return match.replace(queryRegx, '');
    }

    // 如果使用绝对路径
    if(options['absoluteRoot']){
        var sourceFile = path.join(options['root'], options['absoluteRoot'], href.split('?')[0])
    }else {
        var sourceFile = path.normalize(path.dirname(parentFile) + path.sep + basePath + href.split('?')[0])
    }

    if(!options['is_runtime']){

        var url_runtime_dir = path.join(options['root'], options['runtime_dir']),
            url_dist_dir = path.join(options['root'], options['dist_dir']),
        sourceFile = sourceFile.replace(url_dist_dir, url_runtime_dir)
    }
    // remove the url prefix for once
    // the url is abs url
    sourceFile = sourceFile.replace(options['url_prefix'], '')
    
    if(!fs.existsSync(sourceFile)){
        gmutil.error('\n*Error: \n*Inline File Not Exist: '+sourceFile+'\n')

        return match;
    }

    content = getFileContent(sourceFile);

    // add for gulpman store save
    store.save(sourceFile, _file.path)


    if('css' === type){
        if(!isMinifyCss)
            return joint('style', content);
        code = uglifycss.processString(content, options);
        code = joint('style', code);
    }
    else if('js' === type){

        if(!isMinifyJs)
            return joint('script', content);
        code = jsmin(content, options).code.replace(/\n*\t*/gi, '');
        code = joint('script', code);
    }

    return code;

};

//根据标签类型获取内容并压缩
var execture = function(file, options){

    var parentFile = path.normalize(file.path);
    var fileContents = file.contents.toString('utf8');
    if(typeof fileContents === 'undefined'){
        fileContents = getFileContent(file.path);
    }

    // get the single tag replace-content (mined)
    var content = fileContents
        .replace(linkRegx, function($1){

            //like: <link rel="stylesheet" href="assets/css/a.css" />
            return replaceCallback(hrefRegx, $1, parentFile, 'css', options);

        }).replace(jsRegx, function($1){

            //like: <script src="assets/js/a.js"></script>
            return replaceCallback(srcRegx, $1, parentFile, 'js', options);

        }).replace(styleRegx, function($1){

            //like:
            // <style ignore>
            //  #app{
            //      width: 80%;
            //      padding: 10px;
            //  }
            // </style>
            //console.log($1);
            return miniInline($1, 'css', options);

        }).replace(scriptRegx, function($1){
            //like:
            // <script ignore>
            //      var a = 0,
            //          b = 0;
            //      var arr = [];
            //      arr.push(a);
            //      arr.push(b);
            // </script>

            /**
             * @debug for replace bug
             * this trigger the src with type joined together
             * lead into miniInline
             */
            return miniInline($1, 'js', options);
        });

    return content;
};

//get the content of files
var getFileContent = function(file){
    if(!fs.existsSync(file)) throw new Error('File not find: ' + file);
    var fileContent = fs.readFileSync(file, { encoding: 'utf8' });
    return fileContent;
    //file.contents = new Buffer(uglifycss.processString(fileContent, options));
};

//get the mined files content
var getContent = function(file, options){

    var content = execture(file, options);
    return content;
};

//将压缩后的内容替换到html中
var inline = function(options){
    var options = options || {},
        basePath = options.basePath;
    //是否压缩css, 默认压缩
    options.minifyCss = 'undefined' === typeof(options.minifyCss) ? true : options.minifyCss;
    //是否压缩js, 默认压缩
    options.minifyJs = 'undefined' === typeof(options.minifyJs) ? true : options.minifyJs;

    return through2.obj(function(file, enc, next){

        if (file.isStream()) {
            this.emit('error', new PluginError(PLUGIN_NAME, 'Stream content is not supported'));
            return next(null, file);
        }

        _file = file

        if (file.isBuffer()) {
            try {
                var content = getContent(file, options);

                file.contents = new Buffer(content);
            }
            catch (err) {
                this.emit('error', new PluginError(PLUGIN_NAME, err['message']));
            }
        }
        this.push(file);
        return next();


    });

};

module.exports = inline;