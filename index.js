/**
 * Gulpman
 * FOR MODULAR FRONT-END SOURCE COMPILE SYSTEM
 * @author Lucas X 
 * xwlxyjk@gmail.com
 */

'use strict'

// system module
let path = require('path'),
    j = path.join,
    sh = require("shelljs")

// gulp module
let gulp = require('gulp'),
    p = require('gulp-load-plugins')(),

    // modules
    pngquant = require('imagemin-pngquant'),
    browserify = require('browserify'),
    buffer = require('vinyl-buffer'),
    source = require('vinyl-source-stream'),
    es = require('event-stream'),
    globby = require('globby'),
    through = require('through2'),

    // gulpman utils
    gmutil = require('./lib/gmutil'),
    base64 = require('./lib/base64'),
    store = require('./lib/store'),
    htmlInline = require('./lib/inline'),
    revReplace = require('./lib/revReplace'),

    // css spriter
    spriter = require('./lib/spriter')

/**
 * *** FOR GULPER ***
 * ===============================================
 */

/**
 * ### Develop Description
 * 1. 先将静态资源文件的源文件scss, less, es6等，编译输出到asset runtime目录
 * 2. 将模板html文件，更新资源url后输出到 components runtime 目录
 * 3. 进入watch模式，如果有变动，那么更新。
 * 4. watch模式，如果是编译型资源，比如scss, es6等，那么更新输出资源、更新打包等。如果是raw资源，直接复制。
 */

/**
 * ### Production Description
 * 1. 先执行Develop的初始化,生成runtime 资源目录
 * 2. 以runtime目录作为资源，压缩图片、压缩混淆打包JS\CSS等资源
 * 3. 对dist目录中资源及其引用，进行MD5资源重命名，更新html和css、js等有资源引用的文件。
 * 4. 最后重新输出到 components dist目录和assets dist目录
 * 5. md5和非md5文件目前是混合在一起的
 */


// define base vars ========================================
let isDevelop = true,
    isWatching = false

// get the cwd
const _cwd = process.cwd()
const _echo_off = ' >/dev/null 2>&1'

let _opts = {

    // is enable the absolute prefix url
    'is_absolute': true,

    // source url prefix
    'cdn_prefix': '',
    'url_prefix': '/static',

    // define babel optionals
    'babel': {
        'presets': ['es2015', 'react']
    },

    // library path and global module path
    'lib': 'lib',
    'global': 'global',

    // the components source dir
    'components': './components',

    'runtime_views': './views',
    'dist_views': './views_dist',

    'runtime_assets': './assets',
    'dist_assets': './assets_dist'
}


// define raw source type ===================================
const base_source_type = 'js,css',
    img_source_type = 'png,PNG,jpg,JPG,gif,GIF,jpeg,JPEG,webp,WEBP,bmp,BMP',
    img_source_reg = img_source_type.split(',').join('|'),

    font_source_type = 'svg,SVG,tiff,ttf,woff,eot',
    other_source_type = 'tpl,txt,mp3,mp4,ogg,webm,mpg,wav,wmv,mov,ico',

    // the pure raw souce means the source do not need gulp deal!
    pure_source_type = [font_source_type, other_source_type ].join(),
    // all raw source
    all_raw_source_type = [base_source_type, img_source_type, font_source_type, other_source_type].join(),
    all_raw_source_reg = all_raw_source_type.split(',').join('|')


// uncompiled source =====================================
let sass_source,
    es6_source,

    all_raw_source,

    html_source,

    // For publish source 
    js_source,
    lib_source,
    except_lib_source,


    dist_lib_path,
    dist_except_lib_path,

    css_source,
    img_source,
    pure_source,

    dist_html_source,
    dist_css_source,
    dist_all_raw_source


// init vars
function initVars(){
    
    _opts['dist_static'] = j(_opts['dist_assets'], _opts['url_prefix'])

    _opts['runtime_static'] = j(_opts['runtime_assets'], _opts['url_prefix'])

    _opts['runtime_static_tmp'] = j(_opts['runtime_assets'], '.tmp_raw_static')

    // components sources
    sass_source = j(_opts['components'], '**/*.{scss,sass}')
    es6_source = j(_opts['components'], '**/*.{es6,jsx}')

    all_raw_source = j(_opts['components'], '**/*.{'+all_raw_source_type+'}')

    html_source = [j(_opts['components'],'**/*.html'), '!'+j(_opts['components'], _opts['lib'], '**/*.html')]


    // to-be-published source ================================
    js_source = j(_opts['runtime_static'], '**/*.js')
    lib_source = j(_opts['runtime_static'], _opts['lib'], '**/*.*')
    except_lib_source = '!' + lib_source

    dist_lib_path = j(_opts['dist_static'], _opts['lib'])
    dist_except_lib_path = '!' + dist_lib_path
    css_source = j(_opts['runtime_static'], '**/*.css')
    img_source = j(_opts['runtime_static'],'**/*.{'+img_source_type+'}')
    pure_source = j(_opts['runtime_static'], '**/*.{'+pure_source_type+'}')

    // dist source path
    dist_html_source = j(_opts['dist_views'], '**/*.html')
    dist_css_source = j(_opts['dist_static'], '**/*.css')
    dist_all_raw_source = j(_opts['dist_assets'], '**/*.{'+all_raw_source_type+'}')

}

// init vars before gulpman tasks
initVars()


// COMMON UTILS FN  ========================================

function OSInform(title, _message, err){
    let message = _message || title
    
    try {
        // call the os inform
        sh.exec("osascript -e 'display notification \""+message+"\" with title \""+title+"\"'")

    }catch(err){
        gmutil.warn('*Call System Inform Failed!')
    }

    // print the err messsage
    err && err.message && gmutil.error('\n*'+err.plugin+': '+err.name+'\n' + err.message+'\n')

    return {
      then (cb){
        cb && cb()
      }
    }
}


function OSInformError(title, err, cb){
    let filePath = getRelativePath(err.fileName)
    
    return OSInform(title, filePath, err)

}


function getB64ImgReg(){
    return new RegExp('(?=[\'"]?)([\\w\\.\\-\\?\\-\\/]+?(\\.('+img_source_reg+')))(\\?_gm_inline)(?=[\'"]?)', 'gm')
}


// browserify 
function browserified(fpath, sourceDir){

    /*let pathList = _opts['global'].filter(d=>{
        return j(sourceDir, d)
    })*/

    let _bOpts = {
        entries: fpath,
        debug: true,
        extensions: ['.es6', '.jsx', '.js'],

        //global modular
        paths: [
            j(sourceDir, _opts['lib']),
            j(sourceDir, _opts['global'])
        ]
    }

    // use wathcify to browseirfy
    // var watchifybOpts = Object.assign(_bOpts, watchify.args)
    // return watchify(browserify(watchifybOpts)).bundle()

    return browserify(_bOpts)
    .bundle()
    .pipe(source(fpath))
    .pipe(buffer())
    .on('error', function(err){
        OSInformError('Browserify Error', err)  
    })

}


function do_browserify(){
      var files = globby.sync(j(_opts['runtime_static_tmp'], '**/*.es6')),
        tasks = files.map((entry)=>{
            // 注意，此处dest目录必须和src目录不一致，否则dest打包后会把输出结果直接输出到src, 那么会影响后续打包的文件，后续打包的文件的require的文件已经不是srcw文件，而是被dest后的文件，因此会有require、define那块额外添加的代码的冗余

            return browserified(entry, _opts['runtime_static_tmp'])
            .pipe(p.rename(path=>{

                /**
                 * 此处作用是，将.tmp_raw_static目录，
                 * 作为未打包备份目录，不被打包后文件覆盖
                 * 这样.tmp_raw_static目录可以被watch中触发的打包服务
                 */
                
                path['dirname'] = path['dirname'].replace(_opts['runtime_static_tmp'], _opts['runtime_static'])

                path.extname = '.js'
            }))
            .pipe(gulp.dest('./'))
        })

    return es.merge.apply(null, tasks)
}


// get handler for relevancy update
function getRelevancyHandler() {
    return {
        'html': function (rawHtmlFile){
            // html实现了增量编译base64文件
            let basepath = j(_cwd, _opts['components'])
            parseRawHTML(gulp.src(rawHtmlFile), basepath, true)
        },
        // 目前只有raw目录中的scss实现了增量编译
        'css': compile_sass
    }
}


// wrap the store check fn
function storeCheck(filepath){
    return store.check(
        filepath, 
        _opts['runtime_assets'], 
        getRelevancyHandler()
    )
}


// Main Tasks =====================================

gulp.task('gm:clean', ()=>{
    sh.rm('-rf', [

        _opts['runtime_views'],
        _opts['dist_views'],

        _opts['runtime_assets'],
        _opts['dist_assets']

    ])
})

// clean dir includes components
gulp.task('gm:clean-all', ['gm:clean'],()=>{
    sh.rm('-rf', [
        _opts['components'],
    ])
})


gulp.task('gm:compile-copy', ()=>{
    return gulp.src(all_raw_source)
    .pipe(gulp.dest(_opts['runtime_static']))
    // 复制一份 非编译到static备份目录
    .pipe(gulp.dest(_opts['runtime_static_tmp']))
})


function compile_sass(singleFile){
    
    // 此处增量编译scss, 当处于监视状态，只编译修改了的scss文件
    // 此处还没有关联到sass的增量，只关联了raw source中的css
    // @todo
    let _sass_source = singleFile || sass_source

    return gulp.src(_sass_source)
    .pipe(p.sass())
    .on('error', function(err){
        OSInformError('SCSS Compile Error', err)
        // .then(()=>gmutil.error(errMessage))
    })
    .pipe(base64({
        'is_absolute': _opts['is_absolute'],
        'relevancyDir': _opts['runtime_assets'],
        'baseDir': _opts['runtime_static'],
        // 'components': _opts['components'],
        'isDevelop': isDevelop,
        'type': 'css',
        'rule': getB64ImgReg()
    }))
    .on('error', function(err){
        OSInformError('CSS Img-Base64 Error', err)
    })
    .pipe(gulp.dest(_opts['runtime_static']))
    .pipe(through.obj((file, enc ,next)=>{

        if(isWatching){
            gmutil.tip('*Relevancy Source: '+file.path)

            storeCheck(file.path)

        } 

        return next()
    }))
    // 这里没有复制到static的备份目录
}

gulp.task('gm:compile-sass', ()=>{
    
    return compile_sass()
})

gulp.task('gm:compile-sprite', ['gm:compile-sass'], ()=>{

    let files = globby.sync([css_source, except_lib_source]),
        tasks = files.map((entry)=>{

            // 注意，此处dest目录必须和src目录不一致，否则dest打包后会把输出结果直接输出到src, 那么会影响后续打包的文件，后续打包的文件的require的文件已经不是srcw文件，而是被dest后的文件，因此会有require、define那块额外添加的代码的冗余

            // console.log('entry: '+entry)
            return gulp.src(entry)
            .pipe(spriter({
                    'cwd': _cwd,
                    // 'includeMode': 'explicit',
                // The path and file name of where we will save the sprite sheet
                    'dist_root': _opts['runtime_static'],
                    // 'spriteSheet': j(_opts['dist_static'],'sprite_sheet.png'),
                    // Because we don't know where you will end up saving the CSS file at this point in the pipe,
                    // we need a litle help identifying where it will be.
                    // 'pathToSpriteSheetFromCSS': '../sprite_sheet.png'
            }))
            /*.pipe(p.rename(path=>{
                console.log(path)
            }))*/
            .pipe(gulp.dest('./'))

        })

    return es.merge.apply(null, tasks)

})


gulp.task('gm:compile-es6', ()=>{

    return gulp.src(es6_source)
    .pipe(p.babel(_opts['babel']))
    .on('error', err=>{
        OSInformError('Babel Error', err)
    })
    .pipe(p.rename(path=>{
        // 这里有一部分是从es6转成的.js，也有一部分是jsx转成的.js
        // 此处都统一扩展名设置为.es6
        path.extname = '.es6'
    }))
    .pipe(gulp.dest(_opts['runtime_static_tmp']))
    .pipe(gulp.dest(_opts['runtime_static']))
})


gulp.task('gm:compile-browserify', ['gm:compile-es6'], ()=>{
    return do_browserify()
})


gulp.task('gm:compile-html', cb=>{

    return parseRawHTML(gulp.src(html_source), null, true)
})


// only used for publish
gulp.task('gm:publish-html', cb=>{
    // the `null` is basepath
    // the `false` is isRuntimeDir
    return parseRawHTML(gulp.src(html_source), null, false)
})


gulp.task('gm:compile', p.sequence(
    'gm:clean', 
    'gm:compile-copy',
    ['gm:compile-sprite', 'gm:compile-browserify'],
    'gm:compile-html'
))


/**
 * FOR DEVELOP WATCHT ================================
 */

/**
 * 因为task不能传参，这里用全局变量来实现，
 * 后续考虑优化
 * @type {[type]}
 */

let _g_es6_event = null

function updateES6Compile(event){
    _g_es6_event = event
    gulp.start('update_browserify')
}


// 解析html文件中的资源路径和做处理
function parseRawHTML(b, basepath, _isRuntimeDir) {

    return b.pipe(through.obj(function (file, enc, cb){

        if (file.isNull()) {
            this.push(file);
            return cb()
        }
        if (file.isStream()) {
            gmutil.error('*ParseHtml Error: Streaming not supported')
            return cb()
        }

        // file.relative 是根据path.base自动生成的
        if(basepath) file.base = basepath

        let fdirname = path.dirname(file.relative)
        
        // set assets url prefix
        let _urlPrefix

        if(_opts['is_absolute']) {
            _urlPrefix = _opts['url_prefix']
        }else {
            // 判断打包资源中的url路径前缀
            let _fPath = j(_isRuntimeDir ? _opts['runtime_views'] : _opts['dist_views'], fdirname)

            let _staticPath = _isRuntimeDir ? _opts['runtime_static'] : _opts['dist_static']

            _urlPrefix = path.relative(_fPath, _staticPath) 
        }


        let contents = file.contents.toString()
        
        // 所有格式都要处理
        let srcQuoteReg = new RegExp('(?=[\'"]?)([\\w\\.\\-\\?\\-\\/]+?(\\.('+all_raw_source_reg+')))(?=\\?_gm_inline)?(?=[\'"]?)', 'gm')


        let tmp_rs_list = [],
            rs_list = []

        // 提取单标签和双标签
        tmp_rs_list = tmp_rs_list
            .concat(contents.match(gmutil.reg['tagMedia']))
            .concat(contents.match(gmutil.reg['closeTagMedia']))

        // gmutil.error(tmp_rs_list)
            
        // 首先提取标签，然后从标签中提取href或者src
        tmp_rs_list.length && (
            rs_list = tmp_rs_list
            .filter(r=>r.match(srcQuoteReg))
            .map(v=>v.match(srcQuoteReg)[0])
            .filter(r=>!r.match(/^(['"]\/)/gm))
        )
        

        // 这里利用set做去重
        let rs_set = new Set(rs_list)

        // 替换url的的path和前缀
        rs_set.size && rs_set.forEach(epath=>{

            // 对于base64的参数标识要保留，不能清理掉，因为后续要嵌入base64
            let innerReg = new RegExp('(?=[\'"]?)('+epath+')(\\?_gm_inline)*(?=[\'"]?)', 'gm')

            contents = contents.replace(innerReg, j(_urlPrefix, fdirname, epath)+'$2')
        })

        file.contents = new Buffer(contents)

        // gmutil.warn(contents)
        this.push(file)

        gmutil.tip('*Raw HTML File Parsed: '+file.relative)

        cb()
    }))
    .on('error', err=>{
        OSInformError('ParseHtml Error', err)
    })
    .pipe(base64({
        'is_absolute': _opts['is_absolute'],
        'relevancyDir': _opts['runtime_assets'],
        'baseDir': _opts['runtime_assets'],
        'views': _isRuntimeDir ? _opts['runtime_views'] : _opts['dist_views'],
        'dist_assets': _opts['dist_assets'],
        'isDevelop': isDevelop,
        'type': 'html',
        'rule': getB64ImgReg()
    }))
    .on('error', function(err){
        OSInformError('HTML Img-Base64 Error', err)
    })
    .pipe(htmlInline({

        'is_runtime': _isRuntimeDir,
        'absoluteRoot': _opts['is_absolute'] ? (_isRuntimeDir ? _opts['runtime_assets'] :  _opts['dist_assets']) : false,

        queryKey: '_gm_inline',
        minifyCss: _isRuntimeDir ? false : true, // 选择是否压缩css
        minifyJs: _isRuntimeDir ? false : true,  // 选择是否压缩js,

        'dist_dir': _opts['dist_assets'],
        // 这个也是relevancyDir
        'runtime_dir': _opts['runtime_assets'],

        'root': _cwd
        // basePath: _opts['runtime_assets']
    }))
    .pipe(gulp.dest(_isRuntimeDir ? _opts['runtime_views'] : _opts['dist_views']))
}



function getRelativePath(epath) {
    let _tarPath = j(_cwd, _opts['components'])
    let relPath = epath.replace(_tarPath, '')

    return relPath
}


function delChangedFile(epath, delOutDir, type){
    
    let relPath = getRelativePath(epath)
    // 这里可以用path的api来处理后重新生成，用正则不准确可能
    // 删除文件，首先判断类型，来处理拓展名
    if(type == 'js'){
        relPath = relPath.replace(/\.(es6|jsx)$/gm, '.js')

    }else if(type == 'css'){
        relPath = relPath.replace(/\.(scss|sass|css)$/gm, '.css')
    }else {
      // relPath is relPath,keep the extname
    }

    let delFilePath = j(delOutDir, relPath)

    gmutil.tip('Delete File: '+ delFilePath)

    // 删除输出的文件
    sh.rm('-rf', delFilePath)
}


function getTarPath(epath, replaceDir){
    let relPath = getRelativePath(epath),
        tarPath = j(replaceDir, relPath),
        dirPath = path.dirname(tarPath)

    return {
        'tarPath': tarPath,
        'dirPath': dirPath
    }

}


// tasks

gulp.task('update-es6', ()=>{
    let epath = _g_es6_event.path,
        etype = _g_es6_event.type

    return gulp.src(epath)
    .pipe(p.babel(_opts['babel']))
    .pipe(p.rename(path=>{
        let relPath = getRelativePath(epath)

        let namePt = new RegExp(`${path.basename}\.(es6|jsx)$`, 'gm')
        relPath = relPath.replace(namePt, '')

        /**
         * 输出到 未打包备份目录中,
         * 而不是输出到已经打包的目录,
         * 否则会覆盖正式的static目录中打包后的js文件)
         */

        path.dirname = j(_opts['runtime_static_tmp'], relPath)
        path.extname = '.es6'
        
        gmutil.tip('*ES6 File Changed: ' + epath)

    }))
    .pipe(gulp.dest('./'))
})


gulp.task('update_browserify', ['update-es6'], ()=>{
    return do_browserify()
})


gulp.task('gm:develop', ['gm:compile'], ()=>{

    let _cmdBase = {
        'component': {
            '-c': true,
            '-component': true
        }
    }
    
    let _how = process.argv[3],
        _what = process.argv[4]


    let _watch_es6_source = es6_source,
        _watch_css_source = sass_source,
        _watch_html_source = html_source,
        _watch_all_raw_source = all_raw_source


    if(_how in _cmdBase['component'] && _what){

        gmutil.warn('\n*Watch Component: '+_what)
        
        _watch_es6_source = j(_opts['components'], _what, '**/*.{es6,jsx}')
        _watch_css_source = j(_opts['components'], _what, '**/*.{scss,sass}')
    
        _watch_html_source = [j(_opts['components'], _what, '**/*.html'), '!'+j(_opts['components'], _opts['lib'], '**/*.html')]

        _watch_all_raw_source = j(_opts['components'], _what, '**/*.{'+all_raw_source_type+'}')

    }
    

    gmutil.warn('\n*Source Compiled Succeed. \n*Loading source. Waiting ...\n')


    // watch es6\js ----------------------------------
    let js_watcher = gulp.watch(_watch_es6_source)

    js_watcher.on('change', event=>{

        switch(event.type){
            case 'changed':
                updateES6Compile(event)
                break
            case 'added':
                updateES6Compile(event)
                break

            case 'deleted':
                delChangedFile(event.path, _opts['runtime_static'], 'js')
                delChangedFile(event.path, _opts['runtime_static_tmp'], 'js')
                break

            default: 
                throw Error('Unknow Type: ' + event.type)
        }
    })


    // watch scss ----------------------------------
    let css_watcher = gulp.watch(_watch_css_source, ['gm:compile-sass'])

    css_watcher.on('change', event=>{

      let epath = event.path,
          etype = event.type
            
      switch(event.type){
          case 'deleted':
              delChangedFile(epath, _opts['runtime_static'], 'css')
              break
      }

      return false

    })


    // watch html --------------------------------------
    let html_watcher = gulp.watch(_watch_html_source)

    html_watcher.on('change', event=>{
        let epath = event.path,
            etype = event.type,
            f = getTarPath(epath, _opts['runtime_views'])

        
        if(etype == 'changed' || etype == 'added'){
            
            let relPath = getRelativePath(epath)
            
            let rawHtmlFile = j(_opts['components'], relPath)
            
            let basepath = j(_cwd, _opts['components'])
            parseRawHTML(gulp.src(rawHtmlFile), basepath, true)

        }else if(etype == 'deleted'){

            delChangedFile(epath, _opts['runtime_views'])
        }else if(etype == 'renamed'){

            let oldPath = event.old,
                oldf = getTarPath(oldPath, _opts['runtime_views'])            

            sh.cp('-rf', epath, f.dirPath)
            sh.rm('-rf', oldf.tarPath)

            gmutil.tip('Rename HTML File: '+oldf.tarPath)

        }else {
            // ddd
        }
    
    })


    // raw source -------------------------------------
    let raw_watcher = gulp.watch(_watch_all_raw_source)

    raw_watcher.on('change', function(event) {
        let epath = event.path,
            file_extname = path.extname(epath),

            f = getTarPath(epath, _opts['runtime_static']),
            tmp_f = getTarPath(epath, _opts['runtime_static_tmp'])

        if(event.type == 'added' || event.type == 'changed'){
            sh.cp('-rf', epath, f.dirPath)
            gmutil.tip('Copy Raw File To: '+f.tarPath)

            if(file_extname == '.js') {
                sh.cp('-rf', epath, tmp_f.dirPath)
                gmutil.tip('Copy Raw File To: '+tmp_f.tarPath)
            }

            // check relevancy images
            if(event.type == 'changed') {

                // img ,eg.
                let filePath = gmutil.pathInAssets(_cwd, epath, _opts['components'], _opts['runtime_static'])

                storeCheck(filePath)
                
            }
            
        }else if(event.type == 'deleted'){
            sh.rm('-rf', f.tarPath)
            gmutil.tip('Delete Raw File: '+f.tarPath)
            if(file_extname == '.js') {
                sh.rm('-rf', tmp_f.tarPath)
                gmutil.tip('Delete Raw File: '+f.tarPath)
            }

        }else if(event.type == 'renamed'){
            let oldPath = event.old,
                oldf = getTarPath(oldPath, _opts['runtime_static']),
                old_tmpf = getTarPath(oldPath, _opts['runtime_static_tmp'])
            
            gmutil.tip('Rename Raw File: '+oldf.tarPath)

            sh.cp('-rf', epath, f.dirPath)
            sh.rm('-rf', oldf.tarPath)

            if(file_extname == '.js') {
                sh.cp('-rf', epath, tmp_f.dirPath)
                sh.rm('-rf', old_tmpf.tarPath)
                gmutil.tip('Delete Raw File: '+f.tarPath)
            }

        }else {
          gmutil.warn('Other Event: \n' + event)
        }
    })
    .on('error', err=>{
        gmutil.error('Error: ', err)
    })

    // ready for watch --------------------------------
    isWatching = true

    gmutil.tip('\n*Now Watching For Development:\n')
     
})


/**
 * FOR PUBLISH SOURCE ================================
 */

// utils
function setRevReplace(){

    // gmutil.error('cdn: ', _opts['cdn_prefix'])

    let manifest = gulp.src(j(_opts['dist_assets'],'rev-manifest.json'))
    return revReplace({
        'manifest': manifest,
        // 如果is_absolute为false, 那么不启用cdn_prefix
        'prefix': _opts['is_absolute'] ? _opts['cdn_prefix'] : ''
    })
}


// tasks

gulp.task('gm:css', ()=>{
    // 除去lib
    return gulp.src([css_source, except_lib_source])
    .pipe(p.cssnano())
    .pipe(gulp.dest(_opts['dist_static']))
})


gulp.task('gm:imagemin', ()=>{
    // 除去lib
    return gulp.src([img_source, except_lib_source])
    .pipe(p.imagemin({
        progressive: true,
        debug: true,
        svgoPlugins: [{
            'removeViewBox': false
        }],
        use: [pngquant()]
    }))
    .pipe(gulp.dest(_opts['dist_static']))
})


gulp.task('gm:js', ()=>{
    // 除去lib
    return gulp.src([js_source, except_lib_source])
    .pipe(p.uglify())
    .on('error', function (err){ 
        gmutil.error('*Warning \n*Uglify Error: \n', err.message)
        gmutil.warn('*Passed ...')
        return this
    })
    .pipe(gulp.dest(_opts['dist_static']))
})





/**
 * Rev Generate MD5 for Source and File name
 * =================================
 */

gulp.task('gm:rev', p.sequence(
    'gm:rev-lib-pre',
    'gm:rev-source', 
    ['gm:rev-html', 'gm:rev-css'])
)


/**
 * 由于lib属于第三方模块的特殊性，在处理uglify js的时候会导致错误等，
 * 因此特殊处理，只压缩css
 */

// for the lib prepare 
gulp.task('gm:rev-lib-pre', p.sequence('gm:rev-copy-lib', ['gm:lib-mincss', 'gm:lib-uglify']))

// copy lib source to dist lib dir
gulp.task('gm:rev-copy-lib', ()=>{
    return gulp.src(lib_source)
    .pipe(gulp.dest(dist_lib_path))
})

// minify the lib css
gulp.task('gm:lib-mincss', ()=>{
    return gulp.src(j(dist_lib_path, '**/*.css'))
    .pipe(p.cssnano())
    .pipe(gulp.dest(dist_lib_path))
})

// minify the lib js
gulp.task('gm:lib-uglify', ()=>{
    return gulp.src(j(dist_lib_path, '**/*.js'))
    // uglify libjs常会导致错误
    // .pipe(p.uglify())
    .pipe(gulp.dest(dist_lib_path))
})



/**
 * 将dist目录的所有编译后资源，包括css,js,img,font等，做md5
 */
gulp.task('gm:rev-source', ()=>{

    let revAll = new p.revAll({   
        // 禁止参与重命名的文件  
        dontRenameFile: ['.html', /^\/favicon.ico$/],  
        // 无需关联处理文件  
        dontGlobal: [ /^\/favicon.ico$/, '.txt', '.tpl'],  
        // 该项配置只影响当前src的静态资源中 绝对路径的资源引用地址  
        // prefix: _opts['is_absolute'] ? _opts['cdn_prefix'] : '' 
    })

    return gulp.src(dist_all_raw_source)
    .pipe(revAll.revision())
    /**
     * 这里因为assets_url的缘故，
     * dist_all_raw_source的路径要不带static,
     * 否则最终发布的html，assets_url会跑到_opts['cdn_prefix']前面。
     */
    .pipe(gulp.dest(_opts['dist_assets']))
    // 输出manifest文件
    .pipe(revAll.manifestFile())
    .pipe(gulp.dest(_opts['dist_assets']))

})


gulp.task('gm:rev-html', ()=>{
    return gulp.src(dist_html_source)
    .pipe(setRevReplace())
    .pipe(gulp.dest(_opts['dist_views']))
})


gulp.task('gm:rev-css', ()=>{
    /**
     * debug
     * 这个rev插件有个bug,对于css中，以emma-wat-012.jpg这种中划线格式的图片，md5后，css中资源未被替换...
     */
    
    return gulp.src(dist_css_source)
    .pipe(setRevReplace())
    .pipe(gulp.dest(_opts['dist_static']))
})



// create ../assets_dist
gulp.task('gm:create-assets-dist-dir', ()=>{
    sh.mkdir(_opts['dist_assets'])
})

gulp.task('gm:copy-pure-source', ()=>{

    return gulp.src([pure_source, except_lib_source])
    .pipe(gulp.dest(_opts['dist_static']))
})

// for compile publish
gulp.task('gm:copy', [
    'gm:create-assets-dist-dir', 
    'gm:copy-pure-source',
    'gm:publish-html'
],()=>{
    // 从 runtime的views目录内容，拷贝到dist的views目录
    // return gulp.src(j(_opts['runtime_views'], '**/*.*'))
    // .pipe(gulp.dest(_opts['dist_views']))
})

//set Mode in Publish
gulp.task('gm:publish-mode', ()=>{
    
    let args = process.argv.slice(3),
        r = {}

    // 如果在CLI指定了输出目录
    if(args.length){ 

        args.forEach((v,i)=>i%2 == 0 && (r[v] = args[i+1]))

        let _dist_views = r['-v'] || r['-views']

        let _dist_assets = r['-a'] || r['-assets']

        gmutil.warn('*Dist Path Config\n*dist_assets: '+(_dist_assets || '@config')+'\n*dist_views: '+(_dist_views || '@config'));


        (_dist_assets || _dist_views) && updateConf(gmutil.validateObj({
            'dist_assets': _dist_assets,
            'dist_views': _dist_views
        }))

    }


    isDevelop = false
})

// publish source ,based on the runtime source
gulp.task('gm:publish', p.sequence(
    'gm:publish-mode', 
    'gm:compile', 
    'gm:copy',
    ['gm:js', 'gm:css', 'gm:imagemin'], 
    'gm:rev'
))


// init dir and create some meta files
gulp.task('gm:generate-config', ()=>{

    let conf_path = j(__dirname ,'./assets/.babelrc')

    return gulp.src(conf_path)
    .pipe(gulp.dest('./'))
})


gulp.task('gm:generate-components', ()=>{
    // create componetns dir
    // May invalid for windows
    sh.exec('mkdir '+_opts['components']+_echo_off)
})


// init dir and create some meta files
gulp.task('gm:generate-lib', ()=>{

    let prelib_path = j(__dirname ,'./presetlib/**/*.*')

    return gulp.src(prelib_path)
    .pipe(gulp.dest(j(_opts['components'], _opts['lib'])))
})


// init dir and create some meta files
gulp.task('gm:generate-meta', ()=>{

    let meta_path = j(__dirname ,'./meta/**/*.*')

    return gulp.src(meta_path)
    .pipe(gulp.dest(_opts['components']))
})


gulp.task('gm:open-demo', ()=>{
    sh.exec('open '+j(_opts['runtime_views'], 'home/index.html')+_echo_off)
})

// init the proj
gulp.task('gm:init', p.sequence(
    'gm:clean',
    'gm:generate-components', 
    ['gm:generate-meta', 'gm:generate-lib'],
    // 'gm:generate-config',
    'gm:compile',
    'gm:open-demo'
))


// API ================================

// config the dir
function updateConf(opts){

    Object.assign(_opts, opts)
    initVars()

    return _opts
}

exports['config'] = updateConf

// return the _opts
exports['getConfig'] = function(){

    return _opts
}

exports['util'] = gmutil


