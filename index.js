/**
 * Gulpman
 * @description FOR MODULAR FRONT-END SOURCE COMPILE SYSTEM
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

    pngquant = require('imagemin-pngquant'),
    browserify = require('browserify'),
    buffer = require('vinyl-buffer'),
    source = require('vinyl-source-stream'),
    es = require('event-stream'),
    globby = require('globby'),
    through = require('through2'),
    base64 = require('./base64')

    // cheerio = require('gulp-cheerio')


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
    isAbsolutePath = true

let _cwd = process.cwd()

let cdn_prefix = '',
    ASSETS_URL_PREFIX = '/static'



// the components source dir
let COMPONENTS_PATH = './components'

let RUNTIME_VIEWS_PATH = './views'
let DIST_VIEWS_PATH = './views_dist'

let RUNTIME_ASSETS_PATH = './assets'
let DIST_ASSETS_PATH = './assets_dist'


let DIST_STATIC_PATH = j(DIST_ASSETS_PATH, ASSETS_URL_PREFIX)

let RUNTIME_STATIC_PATH = j(RUNTIME_ASSETS_PATH, ASSETS_URL_PREFIX)

let RUNTIME_STATIC_TMP_PATH = j(RUNTIME_ASSETS_PATH, '.tmp_raw_static')


// define raw source type ===================================
let base_source_type = 'js,css',
    img_source_type = 'png,PNG,jpg,JPG,gif,GIF,jpeg,JPEG,webp,WEBP,bmp,BMP',

    font_source_type = 'svg,SVG,tiff,ttf,woff,eot',
    other_source_type = 'tpl,txt,mp3,mp4,ogg,webm,mpg,wav,wmv,mov',

    // the pure raw souce means the source do not need gulp deal!
    pure_source_type = [font_source_type, other_source_type ].join(),
    // all raw source
    all_raw_source_type = [base_source_type, img_source_type, font_source_type, other_source_type].join(),
    type_pt_str = all_raw_source_type.split(',').join('|')


// uncompiled source =====================================
let lib_dir = 'lib',
    global_module = 'common'


let sass_source = j(COMPONENTS_PATH, '**/*.{scss,sass}'),
    es6_source = j(COMPONENTS_PATH, '**/*.{es6,jsx}'),

    all_raw_source = j(COMPONENTS_PATH, '**/*.{'+all_raw_source_type+'}'),

    html_source = [j(COMPONENTS_PATH,'**/*.html'), '!'+j(COMPONENTS_PATH, lib_dir, '**/*.html')]


// to-be-published source ================================
let js_source = j(RUNTIME_STATIC_PATH, '**/*.js'),
    // except_uglifyjs_source = '!' + j(RUNTIME_STATIC_PATH, lib_dir, '**/*{.min,-min,Gulpfile,gulpfile}.js'),
    lib_source = j(RUNTIME_STATIC_PATH, lib_dir, '**/*.*'),
    except_lib_source = '!'+lib_source,

    dist_lib_path = j(DIST_STATIC_PATH, lib_dir),
    css_source = j(RUNTIME_STATIC_PATH, '**/*.css'),
    img_source = j(RUNTIME_STATIC_PATH,'**/*.{'+img_source_type+'}'),
    pure_source = j(RUNTIME_STATIC_PATH, '**/*.{'+pure_source_type+'}')


let dist_html_source = j(DIST_VIEWS_PATH, '**/*.html'),
    dist_css_source = j(DIST_STATIC_PATH, '**/*.css'),
    dist_all_raw_source = j(DIST_ASSETS_PATH, '**/*.{'+all_raw_source_type+'}')


// update the options 
function resetVars(){


    DIST_STATIC_PATH = j(DIST_ASSETS_PATH, ASSETS_URL_PREFIX),

    RUNTIME_STATIC_PATH = j(RUNTIME_ASSETS_PATH, ASSETS_URL_PREFIX),

    RUNTIME_STATIC_TMP_PATH = j(RUNTIME_ASSETS_PATH, '.tmp_raw_static'),

    // the pure raw souce means the source do not need gulp deal!
    pure_source_type = [font_source_type, other_source_type ].join(),
    // all raw source
    all_raw_source_type = [base_source_type, img_source_type, font_source_type, other_source_type].join(),
    type_pt_str = all_raw_source_type.split(',').join('|'),

    sass_source = j(COMPONENTS_PATH, '**/*.{scss,sass}'),
    es6_source = j(COMPONENTS_PATH, '**/*.{es6,jsx}'),

    all_raw_source = j(COMPONENTS_PATH, '**/*.{'+all_raw_source_type+'}'),

    html_source = [j(COMPONENTS_PATH,'**/*.html'), '!'+j(COMPONENTS_PATH, lib_dir, '**/*.html')],

    js_source = j(RUNTIME_STATIC_PATH, '**/*.js'),

    lib_source = j(RUNTIME_STATIC_PATH, lib_dir, '**/*.*'),
    except_lib_source = '!'+lib_source,

    dist_lib_path = j(DIST_STATIC_PATH, lib_dir),
    css_source = j(RUNTIME_STATIC_PATH, '**/*.css'),
    img_source = j(RUNTIME_STATIC_PATH,'**/*.{'+img_source_type+'}'),
    pure_source = j(RUNTIME_STATIC_PATH, '**/*.{'+pure_source_type+'}'),


    dist_html_source = j(DIST_VIEWS_PATH, '**/*.html'),
    dist_css_source = j(DIST_STATIC_PATH, '**/*.css'),
    dist_all_raw_source = j(DIST_ASSETS_PATH, '**/*.{'+all_raw_source_type+'}')
}

// COMMON UTILS FN  ========================================

function OSInform(title, _message, err){
    let message = _message || title
    
    try {
        sh.exec("osascript -e 'display notification \""+message+"\" with title \""+title+"\"'")

        err && err.message && console.log('\n*'+err.plugin+': '+err.name+'\n' + err.message+'\n')
    }catch(err){
        console.log('Call System Inform-script Failed!')
    }

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


// browserify 
function browserified(fpath, sourceDir){

    /*let pathList = global_module.filter(d=>{
        return j(sourceDir, d)
    })*/

    let _bopts = {
        entries: fpath,
        debug: true,
        extensions: ['.es6', '.jsx', '.js'],

        //global modular
        paths: [
            j(sourceDir, lib_dir),
            j(sourceDir, global_module)
        ]
    }

    // use wathcify to browseirfy
    // var watchifybOpts = Object.assign(_bopts, watchify.args)
    // return watchify(browserify(watchifybOpts)).bundle()

    return browserify(_bopts)
    .bundle()
    .pipe(source(fpath))
    .pipe(buffer())
    .on('error', function(err){
        OSInformError('Browserify Error', err)  
    })

}


function do_browserify(){
      var files = globby.sync(j(RUNTIME_STATIC_TMP_PATH, '**/*.es6')),
        tasks = files.map((entry)=>{
            // 注意，此处dest目录必须和src目录不一致，否则dest打包后会把输出结果直接输出到src, 那么会影响后续打包的文件，后续打包的文件的require的文件已经不是srcw文件，而是被dest后的文件，因此会有require、define那块额外添加的代码的冗余

            return browserified(entry, RUNTIME_STATIC_TMP_PATH)
            .pipe(p.rename(path=>{

                /**
                 * 此处作用是，将.tmp_raw_static目录，
                 * 作为未打包备份目录，不被打包后文件覆盖
                 * 这样.tmp_raw_static目录可以被watch中触发的打包服务
                 */
                
                path['dirname'] = path['dirname'].replace(RUNTIME_STATIC_TMP_PATH, RUNTIME_STATIC_PATH)
                // console.log(path)
                path.extname = '.js'
            }))
            .pipe(gulp.dest('./'))
        })

    return es.merge.apply(null, tasks)
}


// Main Tasks =====================================

gulp.task('gm:clean', ()=>{
    sh.rm('-rf', [

        RUNTIME_VIEWS_PATH,
        DIST_VIEWS_PATH,

        RUNTIME_ASSETS_PATH,
        DIST_ASSETS_PATH

    ])
})


gulp.task('gm:compile-copy', ()=>{
    return gulp.src(all_raw_source)
    .pipe(gulp.dest(RUNTIME_STATIC_PATH))
    // 复制一份 非编译到static备份目录
    .pipe(gulp.dest(RUNTIME_STATIC_TMP_PATH))
})


gulp.task('gm:compile-sass', ()=>{
    
    return gulp.src(sass_source)
    .pipe(p.sass())
    .on('error', function(err){
        OSInformError('SCSS Compile Error', err)
        // .then(()=>console.error(errMessage))
    })
    .pipe(base64({
        'isAbsolutePath': isAbsolutePath,
        'baseDir': RUNTIME_STATIC_PATH,
        'type': 'css',
        'rule': new RegExp('(?=[\'"]?)([\\w\\.\\-\\?\\-\\/]+?(\\.('+'png|jpg|gif'+')))(\\?base64\\=true)(?=[\'"]?)', 'gm')
    }))
    .on('error', function(err){
        OSInformError('CSS Img-Base64 Error', err)
    })
    .pipe(gulp.dest(RUNTIME_STATIC_PATH))
    // 这里没有复制到static的备份目录
})


gulp.task('gm:compile-es6', ()=>{

    return gulp.src(es6_source)
    .pipe(p.babel())
    .on('error', err=>{
        OSInformError('Babel Error', err)
    })
    .pipe(p.rename(path=>{
        path.extname = '.es6'
    }))
    .pipe(gulp.dest(RUNTIME_STATIC_TMP_PATH))
    .pipe(gulp.dest(RUNTIME_STATIC_PATH))
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
    ['gm:compile-sass', 'gm:compile-browserify'],
    'gm:compile-html'
))


/**
 * FOR DEVELOP WATCHT ================================
 */

// utils


/**
 * 因为task不能传参，这里用全局变量来实现，
 * 后续考虑优化
 * @type {[type]}
 */

let watch_event = null

function updateES6Compile(event){
    watch_event = event
    gulp.start('update_browserify')
}



function parseRawHTML(b, basepath, _isRuntimeDir) {

    return b.pipe(through.obj(function (file, enc, cb){

        if (file.isNull()) {
            this.push(file);
            return cb()
        }
        if (file.isStream()) {
            console.log('ParseHtml Error: Streaming not supported')
            return cb()
        }

        // file.relative 是根据path.base自动生成的
        if(basepath) file.base = basepath

        let fdirname = path.dirname(file.relative)
        
        // set assets url prefix
        let _urlPrefix

        if(isAbsolutePath) {
            _urlPrefix = ASSETS_URL_PREFIX
        }else {
            // 判断打包资源中的url路径前缀
            let _fPath = j(_isRuntimeDir ? RUNTIME_VIEWS_PATH : DIST_VIEWS_PATH, fdirname)

            let _staticPath = _isRuntimeDir ? RUNTIME_STATIC_PATH : DIST_STATIC_PATH

            _urlPrefix = path.relative(_fPath, _staticPath) 
        }


        let contents = file.contents.toString()

        // let pt1 = /(?:['"]?)([\w\.\-\?\-\/]+?(\.(css|js|tpl|jpg|JPG|png|PNG|gif|GIF|jpeg|JPEG|svg|SVG|ttf|woff|eot)))(?:['"]?)/gm
        
        let src_pt = new RegExp('(?=[\'"]?)([\\w\\.\\-\\?\\-\\/]+?(\\.('+type_pt_str+')))(?=\\?base64\\=true)*(?=[\'"]?)', 'gm')

        let tmp_rs_list = contents.match(src_pt), rs_list = null

        tmp_rs_list && (rs_list = tmp_rs_list.filter(r=>!r.match(/^(['"]\/)/gm)))

        rs_list && rs_list.forEach(epath=>{
            // remove '," on start and end

            let innerReg = new RegExp('(?=[\'"]?)('+epath+')(\\?base64\\=true)*(?=[\'"]?)', 'gm')

            // console.log('innerReg: ', innerReg)

            // console.log(contents.match(innerReg))


            contents = contents.replace(innerReg, j(_urlPrefix, fdirname, epath)+'$2')
        })

        file.contents = new Buffer(contents)
        this.push(file)
        console.log('*Raw HTML File Parsed: '+file.relative)
        cb()
    }))
    .on('error', err=>{
        OSInformError('ParseHtml Error', err)
    })
    .pipe(base64({
        'isAbsolutePath': isAbsolutePath,
        'baseDir': RUNTIME_ASSETS_PATH,
        'type': 'html',
        'rule': new RegExp('(?=[\'"]?)([\\w\\.\\-\\?\\-\\/]+?(\\.('+'png|jpg|gif'+')))(\\?base64\\=true)(?=[\'"]?)', 'gm')
    }))
    .on('error', function(err){
        OSInformError('Html Img-Base64 Error', err)
    })
    .pipe(gulp.dest(_isRuntimeDir ? RUNTIME_VIEWS_PATH : DIST_VIEWS_PATH))
}



function getRelativePath(epath) {
    let _tarPath = j(_cwd, COMPONENTS_PATH)
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

    console.log('Delete File: '+ delFilePath)

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
    // var event = watch_event,
    let epath = watch_event.path,
        etype = watch_event.type

    return gulp.src(epath)
    .pipe(p.babel())
    .pipe(p.rename(path=>{
        let relPath = getRelativePath(epath)

        let namePt = new RegExp(`${path.basename}\.(es6|jsx)$`, 'gm')
        relPath = relPath.replace(namePt, '')

        /**
         * 输出到 未打包备份目录中,
         * 而不是输出到已经打包的目录,
         * 否则会覆盖正式的static目录中打包后的js文件)
         */

        path.dirname = j(RUNTIME_STATIC_TMP_PATH, relPath)
        path.extname = '.es6'
        
        console.log('*ES6 File Changed: ' + epath)

    }))
    .pipe(gulp.dest('./'))
})

gulp.task('update_browserify', ['update-es6'], ()=>{
    return do_browserify()
})


gulp.task('gm:develop', ['gm:compile'],()=>{

    console.log('\n*Source Compiled Succeed. \nPrepare for watching, please wait ...\n')


    // watch es6\js
    let js_watcher = gulp.watch(es6_source)

    js_watcher.on('change', event=>{

        switch(event.type){
            case 'changed':
                updateES6Compile(event)
                break
            case 'added':
                // console.log('**pass js added')
                updateES6Compile(event)
                break

            case 'deleted':
                delChangedFile(event.path, RUNTIME_STATIC_PATH, 'js')
                delChangedFile(event.path, RUNTIME_STATIC_TMP_PATH, 'js')
                break

            default: 
                throw Error('Unknow Type: ' + event.type)
        }
    })


    // watch scss
    let css_watcher = gulp.watch(sass_source, ['gm:compile-sass'])

    css_watcher.on('change', event=>{
      // console.log(event)

      let epath = event.path,
          etype = event.type
            
      switch(event.type){
          case 'deleted':
              delChangedFile(epath, RUNTIME_STATIC_PATH, 'css')
              break
      }

      return false

    })


    // watch html
    let html_watcher = gulp.watch(html_source)

    html_watcher.on('change', event=>{
        let epath = event.path,
            etype = event.type,
            f = getTarPath(epath, RUNTIME_VIEWS_PATH)

        
        if(etype == 'changed' || etype == 'added'){
            
            let relPath = getRelativePath(epath)
            
            let rawHtmlFile = j(COMPONENTS_PATH, relPath)
            // console.log('Html Changed: '+rawHtmlFile)
            
            let basepath = j(_cwd, COMPONENTS_PATH)
            parseRawHTML(gulp.src(rawHtmlFile), basepath, true)
        }else if(etype == 'deleted'){

            delChangedFile(epath, RUNTIME_VIEWS_PATH)
        }else if(etype == 'renamed'){

            let oldPath = event.old,
                oldf = getTarPath(oldPath, RUNTIME_VIEWS_PATH)            

            sh.cp('-rf', epath, f.dirPath)
            sh.rm('-rf', oldf.tarPath)

            console.log('Rename HTML File: '+oldf.tarPath)

        }else {
            // ddd
        }
    
    })


    // raw source
    let raw_watcher = gulp.watch(all_raw_source)

    raw_watcher.on('change', event=>{
        let epath = event.path,
            file_extname = path.extname(epath),

            f = getTarPath(epath, RUNTIME_STATIC_PATH),
            tmp_f = getTarPath(epath, RUNTIME_STATIC_TMP_PATH)

        if(event.type == 'added' || event.type == 'changed'){
            sh.cp('-rf', epath, f.dirPath)
            console.log('Copy Raw File To: '+f.tarPath)

            if(file_extname == '.js') {
                sh.cp('-rf', epath, tmp_f.dirPath)
                console.log('Copy Raw File To: '+tmp_f.tarPath)
            }
            
        }else if(event.type == 'deleted'){
            sh.rm('-rf', f.tarPath)
            console.log('Delete Raw File: '+f.tarPath)
            if(file_extname == '.js') {
                sh.rm('-rf', tmp_f.tarPath)
                console.log('Delete Raw File: '+f.tarPath)
            }
        }else if(event.type == 'renamed'){
            let oldPath = event.old,
                oldf = getTarPath(oldPath, RUNTIME_STATIC_PATH),
                old_tmpf = getTarPath(oldPath, RUNTIME_STATIC_TMP_PATH)
            console.log('Rename Raw File: '+oldf.tarPath)

            sh.cp('-rf', epath, f.dirPath)
            sh.rm('-rf', oldf.tarPath)

            if(file_extname == '.js') {
                sh.cp('-rf', epath, tmp_f.dirPath)
                sh.rm('-rf', old_tmpf.tarPath)
                console.log('Delete Raw File: '+f.tarPath)
            }

        }else {
          console.log('Other Event: ', event)
        }
    })


    console.log('\n*Now Watching For Development:\n')
     
})


/**
 * FOR PUBLISH SOURCE ================================
 */

// utils
function setRevPlace(){
    let manifest = gulp.src(j(DIST_ASSETS_PATH,'rev-manifest.json'))
    return p.revReplace({
        'manifest': manifest,
        'prefix': cdn_prefix
    })
}


// tasks

gulp.task('gm:css', ()=>{
    // 除去lib
    return gulp.src([css_source, except_lib_source])
    .pipe(p.cssnano())
    .pipe(gulp.dest(DIST_STATIC_PATH))
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
    .pipe(gulp.dest(DIST_STATIC_PATH))
})


gulp.task('gm:js', ()=>{
    // 除去lib
    return gulp.src([js_source, except_lib_source])
    .pipe(p.uglify())
    .on('error', function (err){ 
        console.log('*Warning \n*Uglify Error: \n', err.message)
        console.log('*Passed ...')
        return this
    })
    .pipe(gulp.dest(DIST_STATIC_PATH))
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
        prefix: cdn_prefix  
    })

    return gulp.src(dist_all_raw_source)
    .pipe(revAll.revision())
    /**
     * 这里因为assets_url的缘故，
     * dist_all_raw_source的路径要不带static,
     * 否则最终发布的html，assets_url会跑到cdn_prefix前面。
     */
    .pipe(gulp.dest(DIST_ASSETS_PATH))
    // 输出manifest文件
    .pipe(revAll.manifestFile())
    .pipe(gulp.dest(DIST_ASSETS_PATH))

})


gulp.task('gm:rev-html', ()=>{
    return gulp.src(dist_html_source)
    .pipe(setRevPlace())
    .pipe(gulp.dest(DIST_VIEWS_PATH))
})


gulp.task('gm:rev-css', ()=>{
    /**
     * debug
     * 这个rev插件有个bug,对于css中，以emma-wat-012.jpg这种中划线格式的图片，md5后，css中资源未被替换...
     */
    
    return gulp.src(dist_css_source)
    .pipe(setRevPlace())
    .pipe(gulp.dest(DIST_STATIC_PATH))
})



// create ../assets_dist
gulp.task('gm:create-assets-dist-dir', ()=>{
    sh.mkdir(DIST_ASSETS_PATH)
})

gulp.task('gm:copy-pure-source', ()=>{

    return gulp.src([pure_source, except_lib_source])
    .pipe(gulp.dest(DIST_STATIC_PATH))
})

// for compile publish
gulp.task('gm:copy', [
    'gm:create-assets-dist-dir', 
    'gm:copy-pure-source',
    'gm:publish-html'
],()=>{
    // 从 runtime的views目录内容，拷贝到dist的views目录
    // return gulp.src(j(RUNTIME_VIEWS_PATH, '**/*.*'))
    // .pipe(gulp.dest(DIST_VIEWS_PATH))
})

//set Mode in Publish
gulp.task('gm:publish-mode', ()=>{
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
gulp.task('gm:generate-meta', ()=>{

    let meta_path = j(__dirname ,'./meta/**/*.*')

    // May not useful for windows
    sh.exec('mkdir '+COMPONENTS_PATH+' >& /dev/null')

    // sh.mkdir(COMPONENTS_PATH)

    return gulp.src(meta_path)
    .pipe(gulp.dest(COMPONENTS_PATH))
})

gulp.task('gm:init', p.sequence('gm:clean' ,'gm:generate-meta', 'gm:compile'))


// API ============================

// config the dir
exports['config'] = function(opts){

    opts['is_absolute'] !== undefined && (isAbsolutePath = opts['is_absolute'])


    opts['cdn_prefix'] && (cdn_prefix =  opts['cdn_prefix'])

    opts['url_prefix'] && (ASSETS_URL_PREFIX = opts['url_prefix'])

    opts['components'] && (COMPONENTS_PATH = opts['components'])

    opts['runtime_views'] && (RUNTIME_VIEWS_PATH = opts['runtime_views'])

    opts['dist_views'] && (DIST_VIEWS_PATH = opts['dist_views'])


    opts['runtime_assets'] && (RUNTIME_ASSETS_PATH = opts['runtime_assets'])

    opts['dist_assets'] && (DIST_ASSETS_PATH = opts['dist_assets'])

    // the js lib dir
    opts['lib'] && (lib_dir = opts['lib'])

    // global module
    opts['global'] && (global_module = opts['global_module'])

    resetVars()

}

