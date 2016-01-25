
[![Coverage Status](https://raw.githubusercontent.com/xunuoi/gulpman/master/assets/logo.png)](https://thinkjs.org/)

-----

[![NPM version](https://img.shields.io/npm/v/gulpman.svg?style=flat-square)](http://badge.fury.io/js/gulpman)
<img src="https://raw.githubusercontent.com/xunuoi/gulpman/master/assets/build.png?style=flat-square" width="90" alt="Build status" />
<img src="https://raw.githubusercontent.com/xunuoi/gulpman/master/assets/coverage.png?style=flat-square" width="106" alt="Coverage Status" />


# gulpman

- Create Modular Front-End Build System, based on gulp , more light and easier than FIS!
- 基于gulp的前端模块化解决方案，比百度FIS更简单、灵活、可控性高，会gulp就会定制自己的方案
- 集成`SCSS|ES6|Babel|Browserify|cssnano|uglify|imagmein`等常用组件，做到一站式自动化解决方案，同时清晰、可控，定制、修改都超简单
- 扩展性高，gulp现有的插件都可以拼装、加入到gulpman中使用，你可以自己根据实际情况组合、修改，比如可以轻松整合browser-sync到构建系统中。



###Introduction 说明
- 支持Mac、Linux环境下安装、使用
- Windows环境未做测试，由于安装脚本使用到shell，windows不支持sh，可能需要手动安装`gulp-sass`等模块
- Node版本需要不低于4.2.0，如果要兼容0.1x的旧版本nodejs，直接修改源码`index.js`中的语法即可，修改为ES5语法就能正常使用


###Install 安装
cd into your project dir and install:

`npm install gulpman --save-dev`




###Usage 使用


####In Your Gulpfile:

- 只需要require gulpman模块，就会自动加载`gm:publish`, `gm:develop`（开发监视模式）等task到环境中
- 使用时在命令行中直接输入`gulp gm:publish`即可执行gulpman预置的任务


```Javascript
/**
 * Gulpfile.js
 */


var gulp = require('gulp'),
    gman = require('gulpman')

// your other tasks ...你的其他task
// xxx ...


/**
 * 配置gulpman ======================
 * Use config API
 * 设置路径、CDN、资源URL前缀等，API超级简单
 */

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


####CLI 执行Task:

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


####目录说明

* 使用gulpman按照模块划分后，模块根目录可以是`./components`(默认，可配置)，如果你有个模块是foo，那么应该有如下目录：`./components/foo`，然后跟foo模块相关的`html|js|css|fonts|image`等资源文件都放到`foo`下，这个结构下，做开发时非常清晰、高效，便于模块组织、资源定位等。
* 通过`gm:publish`命令构建后，会自动生成模板`views`目录，和静态资源`assets`目录。



####什么是全局模块目录：

- gulpman.config的配置中，lib和global都是全局模块目录。举个例子说明：你的`components/lib`目录下有一个模块 `foo.js`，就是: `components/lib/foo.js`，那么你在你的es6文件中，就可以这样使用：`import foo from 'foo'`，不需要写成 `import foo from '../lib/foo'`
- 同理`global`那个配置也是这样的，推荐将lib目录设置成跟`bower`一致的，全部来存放第三方类库，而`global`设置的目录，比如叫`common`，可以存放自己的`公用模块`。这样开发会更加灵活、方便。
- 注意全局模块不要有同名冲突。




###Any Question

- 如有问题，请联系我：
- xunuoi@163.com
- xwlxyjk@gmail.com

