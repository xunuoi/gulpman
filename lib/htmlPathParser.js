/**
 * FOR PARSE HTML REF PATH
 */

'use strict'


var through = require('through2'),
    path = require('path'),
    j = path.join,
    // gulpman utils
    gmutil = require('./gmutil')



function _dealHTML(conf){
    
    let _opts = conf['_opts'],
        basepath = conf['basepath'],
        _isRuntimeDir = conf['_isRuntimeDir'],
        all_raw_source_reg = conf['all_raw_source_reg']


    return through.obj(function (file, enc, cb){

        if (file.isNull()) {
            this.push(file);
            return cb()
        }
        if (file.isStream()) {
            gmutil.error('*ParseHtml Error: Streaming not supported')
            return cb()
        }

        let contents = file.contents.toString()

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

        
        // 所有格式都要处理
        let srcQuoteReg = new RegExp('(?=[\'"]?)([\\w\\.\\-\\?\\-\\/\\:]+?(\\.('+all_raw_source_reg+')))(?=\\?_gm_inline)?(?=[\'"]?)', 'gm')
            // httpReg = /^http(s)?\:/


        let tmp_rs_list = [],
            rs_list = []

        // 提取单标签和双标签
        tmp_rs_list = tmp_rs_list
            .concat(contents.match(gmutil.reg['tagMedia']))
            .concat(contents.match(gmutil.reg['closeTagMedia']))

        // 首先提取标签，然后从标签中提取href或者src
        tmp_rs_list.length && (
            rs_list = tmp_rs_list
            .filter(r=>(r && r.match(srcQuoteReg)))
            .map(v=>v.match(srcQuoteReg)[0])
            .filter(r=>{
                // remove the http:xxx.com/xx and base64 data url
                // 只处理相对路径
                // 不处理绝对路径、http、dataURL
                return gmutil.isUrl('relative', r)
            })
            .filter(r=>!r.match(/^(['"]\/)/gm))
        )
        
        // 这里利用set做去重
        let rs_set = new Set(rs_list),
            srcPrefix = j(_urlPrefix, fdirname)

        // 替换url的的path和前缀
        rs_set.size && rs_set.forEach(epath=>{
            // 对于base64的参数标识要保留，不能清理掉，因为后续要嵌入base64
            let innerReg = new RegExp('(?=[\'"]?)('+epath+')(\\?_gm_inline)*(?=[\'"]?)', 'gm')

            contents = contents.replace(innerReg, j(srcPrefix, epath)+'$2')
        })

        // dealing with usemin build mark syntax
        // when in publish, not runtime-dir
        if(!_isRuntimeDir) {
            // 这里处理usemin 的build的注释内容
            contents = gmutil.replaceBuildBlock(contents, srcPrefix)
        }

        file.contents = new Buffer(contents)
        
        gmutil.tip('*Raw HTML File Parsed: '+file.relative)

        this.push(file)
        cb()
    })
}


module.exports = _dealHTML
