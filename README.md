# gulpman
- Create Modular Front-End Build System, based on gulp , more light and easier than FIS!
- 基于gulp的前端模块化解决方案，比百度FIS更简单、灵活、可控性高，会gulp就会定制自己的方案
- 集成SCSS|ES6|Babel|Browserify|cssnano|uglify|imagmein等常用组件，做到一站式自动化解决方案，同时清晰、可控，定制、修改都超简单
- 扩展性高，gulp现有的插件都可以拼装、加入到gulpman中使用，你可以自己根据实际情况组合、修改


###Introduction 说明
- 支持Mac、Linux环境下安装、使用
- Windows环境未做测试，由于安装脚本使用到shell，windows不支持sh，可能需要手动安装gulp-sass等模块
- Node版本需要不低于4.2.0，如果要兼容0.1x的旧版本nodejs，直接修改源码index.js中的语法即可，修改为ES5语法就能正常使用


###Install 安装
cd into your project dir and install:

`npm install gulpman --save-dev`



###Usage 使用

####In Your gulpfile:

只需要require gulpman模块，就会自动加载gm:publish、gm:develop（开发监视模式）等task，使用时在命令行直接输入gulp gm:publish即可执行

```Javascript
/**
 * Gulpfile.js
 */


var gulp = require('gulp'),
    gman = require('gulpman')


// your other tasks ...你的其他task


// 设置路径、CDN、资源URL前缀等，API超级简单
// if you want to set the dir, you can use config API:

gman.config({
    
    // 是否使用绝对路径，默认true,推荐使用，方便服务器配置。比如`/static/home/main.js`这种风格。
    // 如果is_absolute是false, 那么可能是`../../assets/static/home/main.js`这种风格。
    // 具体取决于项目情况、服务端配置等。
    // if set the assets url prefix as absolute or relative, default: true
    'is_absolute': true,

    // cdn prefix 配置CDN
    'cdn_prefix': '', 

    // 配置资源URL前缀，建议 /xxx这种
    // usually set as /static, this involves the server config ,such as the static path of nginx
    'url_prefix': '/static' 


    // 模块COMPONENTS目录，同一个模块的html和资源文件在一起。默认 'components'即可
    'components': 'components',

    // develop和publish下的views目录，跟服务端框架的views目录配置一致，比如express
    'runtime_views': 'views',
    'dist_views': 'views_dist',

    // develop和publish下的assets静态目录，跟服务器配置有关，比如nginx的static目录指向
    'runtime_assets': 'assets',
    'dist_assets': 'assets_dist',

    // 第三方JS类库、模块的目录，推荐设置为`lib`或`bower_components`（这样bower可以直接安装到这个目录）
    // 这个目录默认打包时为全局模块目录，可以直接`require('xxx')`，而不用加相对路径
    // the js library dir, set as a global module. Also you can set as bower_components
    'lib': 'lib', 

    // 可以添加一个自定的全局模块目录，该目录下的js模块，也作为全局模块来require，不需要相对路径。
    // the global module dir
    'global': 'common' 
})


```

####In Your CLI:

```Shell

# 初始化目录，建立components目录并添加一份html的demo文件
# init components dir and a html demo
gulp gm:init

# publish 发布资源，包括合并、压缩资源、rev产生MD5等
gulp gm:publish

# develop and watch 开发模式，监视相关文件变动，增量更新
gulp gm:develop

# clean 清理构建输出的目录和文件
gulp gm:clean

# 编译输出一份运行时资源文件，但是不进入监视状态
# compile for develop, not watch
gulp gm:compile


```


###Any Question

- 如有问题，请联系我：
- xunuoi@163.com
- xwlxyjk@gmail.com

