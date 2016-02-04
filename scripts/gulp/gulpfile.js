/**
 * Gulpman demo gulpfile.js
 * Config the gulpman by yourself
 */


var gulp = require('gulp'),
    gulpman = require('gulpman')


// 配置gulpman
gulpman.config({

    // 是否启用资源绝对路径
    // if set the `is_absolute` as false, then the url of source may be like '../assets/static/home/logo.png'
    'is_absolute': false // default is true
    

    // cdn prefix 配置CDN域名前缀
    //'cdn_prefix': '', 


    // 配置资源URL前缀，建议 /xxx这种
    // usually set as /static, this involves the server config ,such as the static path of nginx
    //'url_prefix': '/static' // default `/static`


    // 组件COMPONENTS目录，同一个模块的html和资源文件在一起。默认 'components'即可
    //'components': 'components',


    //views目录，跟服务端框架的views目录配置一致，比如express
    //'runtime_views': 'views',
    //'dist_views': 'views_dist',


    // develop和publish下的assets静态目录，跟服务器配置有关，比如nginx的static目录指向
    //'runtime_assets': 'assets',
    //'dist_assets': 'assets_dist',


    // 第三方JS类库、模块的目录，推荐设置为`lib`或`bower_components`（这样bower可以直接安装到这个目录）
    // 这个目录默认打包时为全局模块目录，可以直接`import xxx from 'xxx'`，而不用加相对路径
    //'lib': 'lib', 


    // 可以添加一个自定的全局模块目录，该目录下的js模块，也作为全局模块来require，不需要相对路径。
    // the global module dir
    //'global': 'common' 
    
})


// 你的其他task或者与gulpman的组合
// ...

