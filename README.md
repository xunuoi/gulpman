
[![Coverage Status](https://raw.githubusercontent.com/xunuoi/gulpman/master/assets/logo.png)](http://karat.cc/article/56a351c3e48d2d05682aa0ac/)

-----

[![NPM version](https://img.shields.io/npm/v/gulpman.svg?style=flat-square)](http://badge.fury.io/js/gulpman)
<img src="https://raw.githubusercontent.com/xunuoi/gulpman/master/assets/build.png?style=flat-square" width="90" alt="Build status" />


# gulpman

[简体中文文档](https://github.com/xunuoi/gulpman/blob/master/README_zh-CN.md)

- Create Modular Front-End Build System, based on gulp , more light and easier than FIS!
- Component Oriented Solution, based on `gulp`. More simple, flexible, expandable and stable than `FIS`. Everyone know gulp can do secondary development.
- Support `base64` image in `html/CSS`
- Support `JS/CSS` inlnied in html
- Intergrated with `spritesmith`, support auto sprite img
- Intergrated with `icon-font`, support SVG 2 Iconfont.
- Intergrated with `usemin`，support complex combo/package.
- Supoort FE Tpl embed function， the `.tpl` file will packaged into js file，support async js loading.
- Intergrated with `SCSS|ES6|ReactJS|Babel|Browserify|cssnano|uglify|imagmein` and other plugins，One-Stop Solution Service， very Simple and Strong
- High scalability, compatiable with almost `gulp` plugins, you can use them in `gulpman`. For example, you can put `browser-sync` in your gulpman build system
- Intergrated with `karma` framework，support `babel/es6` unit test and coverage result.


##Introduction
- Support Mac、Linux
- No full test under Windows. You can install `gulp`、`gulp-sass` manually
- Node need higher than 4.0.0
- *For npm 3, after run `npm install`，maybe need install `gulp-sass``babel-preset-es2015` `babel-preset-react`


##Install
- `npm install gulpman --save-dev`


#### Note
* If error happened in npm install，such as `/usr/local/lib/node_modules` permission error, fix this by `sudo chown -R "$(whoami)"`+`Path`
* `sudo npm install` is not recommended
* The imagemin-pngquant module need`libpng-devel`，if in Linux, please run `yum install libpng-devel` at first
* If install failed, check the `npm-debug.log`，is there are some `ENOMEM`error



##Config

###0. Support Auto Mode, no Config

* You can skip `Config`, and directly jump to `Usage`


###1. Config gulpfile.js:

- require the `gulpman` in your gulpfile.js，then it will load `gm:publish`, `gm:develop` into gulp tasks.
- `gulp gm:publish` or `gulp gm:develop` in terminal then it will work


```Javascript
/**
 * Gulpfile.js
 */


var gulp = require('gulp'),
    gman = require('gulpman')

// your other tasks ...你的其他task
// xxx ...


/**
 * config gulpman ======================
 * Use config API
 * assets path, CDN, URL prefix
 */

gman.config({
    
    // whether use absolute path, default `true` 
    'is_absolute': true,

    // cdn prefix support［string|array|function］arguments
    'cdn_prefix': '', 

    // url prefix, defautl `/static`. This involves the server config ,such as the static path of nginx
    'url_prefix': '/static' 


    /** use spritesmith for css-img sprite
     * Based on Spritesmith: https://github.com/Ensighten/spritesmith
     * Automatecially generate Sprite Image & CSS
     **/
    //'spritesmith': { },
    
    /** usemin config **/
    // 'usemin': {}


    // The COMPONENTS directory
    'components': 'components',

    // For development assets and templates folder, related to Server Config
    'runtime_views': 'views',
    'dist_views': 'views_dist',

    // For production assets and templates folder, related to Server Config
    'runtime_assets': 'assets',
    'dist_assets': 'assets_dist',

    // The js library dir, set as a global module. Also you can set as `bower_components`
    'lib': 'lib', 

    // You can add one customer global directory, so you can require module name directly, like: `require ('xxx')`. The xxx is in this directory
    'global': 'common' 
})


```

###2. How to config CDN better

* `cdn_prefix` support String, Array, Function
* if argument is array, the CDN will be an random value
* if argument is function，it would input one argument, `mediaFile`

```Javascript

'cdn_prefix': function (fileName) {
        
        console.log(fileName)

        var c_list = [
            'http://s0.com', 
            'http://s1.com', 
            'http://s2.com', 
            'http://s3.com',
            'http://s4.com'
        ]
        // You can customized your strategy
        if(hostFile.match(/\.html$/gm)){
            return c_list[0]
        }else {
            return c_list[1]
        }
    },
```

###3. 对于`is_absolute`的说明

* `is_absolute`是指输出的html文件中的资源src/url，否使用绝对路径，默认值true，即启用绝对目录。 

* [常用]当使用服务器配置静态目录的情况下，推荐使用绝对目录。比如配合nginx，指定某个目录为静态资源目录。类似`/static/home/main.js`这种风格。

* 如果无服务端情况下，有需要本地调试，推荐设置is_absolute为false, 即启用相对路径。类似`../../assets/static/home/main.js`这种风格。

* 当is_absolute为false(启用相对路径)的情况下，直接打开输出的views目录下的html文件，就可以正常浏览、运行、调试



###4. gulpman目录说明

* 使用gulpman按照模块划分后，模块根目录可以是`./components`(默认，可配置)，如果你有个模块是foo，那么应该有如下目录：`./components/foo`，然后跟foo模块相关的`html|js|css|fonts|image`等资源文件都放到`foo`下，这个结构下，做开发时非常清晰、高效，便于模块组织、资源定位等。

* 通过`gm:develop`命令进入`develop`开发模式后，会自动生成模板`views`目录，和静态资源`assets`目录。

* 通过`gm:publish`命令来构建发布资源，会自动生成生产环境下的模板目录`views_dist`，和静态资源目录`assets_dist`。


###5. 什么是全局模块目录：

- 对应`Browserify`的打包功能，`全局目录`是指可以直接`require`或者`import`其下的js模块的目录

- `gulpman.config`的配置中，`lib`和`global`都是JS的全局模块目录。举个例子说明：
* 你的`components/lib`目录下有一个模块 `foo.js`，就是: `components/lib/foo.js`，那么你在你的es6文件中，就可以这样使用：`import foo from 'foo'`，不需要写成 `import foo from '../lib/foo'`

- 同理`global`那个配置也是这样的，推荐将lib目录设置成跟`bower`一致的，全部来存放第三方类库，而`global`设置的目录，比如叫`common`，可以存放自己的`公用模块`。这样开发会更加灵活、方便。

- 注意全局模块不要有同名冲突。


###6. 支持复杂目录和多级目录设定

* 比如下面这种复杂路径：

```Javascript
gulpman.config({
    'is_absolute': false,
    'components': 'components/cc',
    'runtime_views': 'runtime_views/rv',
    'dist_views': 'dist_views/dv/dv',

    'dist_assets': 'dist_assets/da',
    'runtime_assets': 'runtime_assets/ra/ra',
})
```


##Usage 使用

###1. CLI 执行Task:

```Shell

# 初始化目录，建立components目录并添加一份html的demo文件
# init components dir and a html demo
gulp gm:init


# develop and watch 开发模式，监视相关文件变动，增量更新
gulp gm:develop

# 指定监视某个component, 提高性能和效率
gulp gm:develop -c component_name


# publish 发布资源，包括合并、压缩资源、rev产生MD5等
gulp gm:publish

# publish命令支持`-a`和`-v`参数指定输出资源/模板目录(可选)
gulp gm:publish -v your_views_dist -a your_assets_dist

# clean 清理构建输出的目录和文件
gulp gm:clean

# 编译输出一份运行时资源文件，但是不进入监视状态
# compile for develop, not watch
gulp gm:compile

```


###2. 开发中只监视某个component目录

* 随着项目变大，开发中如果全局监视所有component资源，效率将会降低，因此可使用gulpman提供的监视子component的方式来开发，提高性能

* 比如说，只监视components目录下的home模块：

```Shell

gulp gm:develop -c home

```


###3. 如何在gulpman下使用React
* 安装React: `npm install react react-dom`
* 在ES6文件中使用

```Javascript
import React from 'react';
import ReactDOM from 'react-dom';

// xxx
```


###4. 如何在js|es6|jsx中使用tpl模板

* 目前支持.tpl扩展名的模板文件，直接打包到最终的js文件中

* 用法：`import dialogTpl from './dialog.tpl'` 或者 `var dialogTpl = require('./dialog.tpl')`



###5. 如何在HTML/CSS中嵌入base64编码的图片

* 只需要图片资源后面添加`?_gm_inline`即可
* 打包时候会将图片生成`base64`编码替换到到html中


#####html

```html
<p class="play"> 
    <img width="480" alt="Karat 克拉" src="./img/testb64.png?_gm_inline" />
</p>
```

#####CSS/SCSS

```css

.test {
    background: url(./img/testb64.png?_gm_inline) no-repeat;
}
```

###6. 如何在HTML中嵌入内联CSS/JS

* 类似图片base64,只需要资源后面添加`?_gm_inline`即可

```html
<script src="./plugin.js?_gm_inline" type="text/javascript"></script>

<link href="./dialog.css?_gm_inline" rel="stylesheet" type="text/css" >
```

* 注：所有内嵌嵌入的资源，包括图片/JS/CSS，在develop(监视)模式下，都已自动关联更新。即如果a.html文件中，内联嵌入了一个b.css，如果b.css发生了修改，那么a.html会自动编译更新。


###7. 如何使用Sprite雪碧图

* 基于spritesmith实现，在gulpman.config 中可传入spritesmith配置opts
* 关于spritesmith详细参见：[https://github.com/Ensighten/spritesmith](https://github.com/Ensighten/spritesmith)
* 只需要在scss文件中的图片url资源后面添加`?_gm_sprite`即可

```css
.demo {
    background: url(./img/abc.png?_gm_sprite) no-repeat;
    
    /* other style you can set ...*/
    width: 50px;
    height: 50px;
}
```

###8. 如何使用Usemin

* 整合usemin，在gulpman.config 中可传入usemin的配置opts
* 关于usemin详细参见：[https://github.com/zont/gulp-usemin](https://github.com/zont/gulp-usemin)
* 只需要在html文件中添加usemin的build注释即可。支持`js`|`css`|`inlinejs`|`inlinecss`等语法
* 注意build注释中配置的输出路径写相对路径即可，跟script、link等标签类似，gulpman会自动转换成最终输出路径

```html

<!-- build:css ./home.css -->
<link rel="stylesheet" type="text/css" href="./main.css">
<link rel="stylesheet" type="text/css" href="./fff.css">
<!-- endbuild -->


<!-- build:js ../lib/base_lib.js -->
<script type="text/javascript" src="../lib/jquery.js"></script>
<script type="text/javascript" src="../lib/react.js"></script>
<!-- endbuild -->
```


###9. 如何使用前端js模板
* 支持tpl扩展名，放到components相关目录下即可，js 可以直接require或者import
* 最终会作为字符串格式打包进js
* tpl中仍然支持资源嵌入和图片base64等，如参照前面_gm_inline等语法即可

- import到es6中
```js
    import dialogTpl from './dialog.tpl'
```

- 或者使用require语法
```js
    var dialogTpl = require('./dialog.tpl')
```

###10. 使用iconfont转换
* 可以将svg转换成icon-font，用`@font-face`方式引用
* 初次使用先安装，运行`gulp gm:iconfont:install`
* 将svg文件放到`components/iconfonts/source`目录下，运行`gulp gm:iconfont`即可
* 自动生成的icon-font和css文件将会在`iconfonts/gmicon`目录下


###11. 支持LAB.js来完成异步加载js
* 引入LAB.js到项目中
* 使用LAB的api来加载即可，使用相对路径
* 代码用例: `$LAB.script("../testload/test.js").wait(()=>{console.log('test loaded')})`


###12. 如何启用karma单元测试
* 初次使用先安装，运行`gulp gm:karma:install`，会安装依赖和生成`karma.conf.js`文件
* 在您的components中的对应模块目录下，建立一个spec文件夹，将对应的spec文件放在里面，文件拓展名是.es6
* 运行 `gulp gm:karma:start` 来启动单元测试(watch模式)，将会运行各spec文件，完成后可在生成的coverage文件夹中查看覆盖率结果
* 指定spec目录、browsers等karma的选项，可以在`karma.conf.js`中设置、定制等



###教程
[浏览教程链接](http://karat.cc/article/56a351c3e48d2d05682aa0ac "karat.cc")

###License
MIT
