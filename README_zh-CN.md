
[![Coverage Status](https://raw.githubusercontent.com/xunuoi/gulpman/master/assets/logo.png)](http://karat.cc/article/56a351c3e48d2d05682aa0ac/)

-----

[![NPM version](https://img.shields.io/npm/v/gulpman.svg?style=flat-square)](http://badge.fury.io/js/gulpman)
<img src="https://raw.githubusercontent.com/xunuoi/gulpman/master/assets/build.png?style=flat-square" width="90" alt="Build status" />


# gulpman

[English Document](https://github.com/xunuoi/gulpman/blob/master/README.md)

- 支持资源模块化组织方式，通过相对路径运算，像百度的FIS一样，可以将`js/css/img/fonts/tpl`按照功能单位组织到同一个目录中，不再分散维护。Gulpman运行时会自动分发各种资源到正确目录。
- 概念介绍: [前端工程之模块化](http://fex.baidu.com/blog/2014/03/fis-module/)
- 基于`gulp`的前端组件化、模块化解决方案，更简单、灵活、可控性高，会gulp就会定制自己的方案
- 支持图片`base64`方式嵌入到`html/CSS`
- 支持`JS/CSS`内联方式嵌入html文件
- 整合`spritesmith`，简单生成sprite雪碧图
- 整合`icon-font`转换，支持svg转换
- 整合`usemin`，构建合并更加灵活强大
- 支持前端js模板嵌入，`tpl`格式的直接构建打包到最终js文件，支持异步加载js
- 集成`SCSS|ES6|ReactJS|Babel|Browserify|cssnano|uglify|imagmein`等常用组件，做到一站式自动化解决方案，同时清晰、可控，定制、修改简单
- 扩展性高，`gulp`现有的插件都可以拼装、加入到`gulpman`中使用，你可以自己根据实际情况组合、修改，比如可以轻松整合`browser-sync`到构建系统中。
- 整合`karma`单元测试框架，适配`babel和es6`的代码单元测试和`coverage`



##说明
- 支持Mac、Linux环境下安装、使用
- Windows环境未做完整安装测试，由于安装脚本使用到shell，windows不支持shell，执行完`npm install gulpman --save-dev`后，可能需要手动安装`gulp`、`gulp-sass`模块
- 如果手动安装`gulp-sass`,建议使用淘宝的`cnpm`来完成，避免国内网络导致`npm`安装失败
- Node版本需要不低于4.0.0
- *注意目前对于npm 3版本及以上(目前大家基本都是2.x)，运行完`npm install`后，可能需要手动安装`gulp-sass`, `babel-preset-es2015`, `babel-preset-react`,`browserify-css`等几个依赖


##安装
- `npm install gulpman --save-dev`

#### 注：
* 安装中若npm报出目录权限导致的error，比如涉及到`/usr/local/lib/node_modules`权限的报错，请请检查其权限是否正常并用chown来修复，将拥有者修改为当前登录用户即可。
* 可以使用 `sudo chown -R "$(whoami)"`+`路径`来修复
* 不要使用`sudo npm install`来手工安装因为权限问题而失败的模块。请修改权限后，再用`npm install`来安装即可
* 如果你本地node和npm的安装和权限正常，那gulpman的安装过程应该都是顺利和成功的。
* 图片压缩模块imagemin-pngquant需要依赖`libpng-devel`，如果是Linux环境，建议先运行`yum install libpng-devel`来确保安装
* 安装过程中无故退出，请查看`npm-debug.log`，检查是否是内存不足`ENOMEM`导致。



##配置

###0. 支持自动默认模式，无需配置即使用

* 可直接跳过`Config 配置`处的说明，直接去看后面的`Usage 使用`内容


###1. 配置 gulpfile.js:

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
 * 设置路径、CDN、资源URL前缀等，API简单
 */

gman.config({
    
    // 是否使用绝对路径，默认值true, 推荐使用，方便服务器配置。比如`/static/home/main.js`这种风格。
    // 如果无服务端情况下，本地调试，可以设置is_absolute为false, 那么会是类似`../../assets/static/home/main.js`这种风格
    'is_absolute': true,

    // cdn prefix 配置CDN， 支持［字符串|数组|函数］ 3中传参方式
    'cdn_prefix': '',

    // 配置资源URL前缀，建议类似 /static这种
    // usually set as /static, this involves the server config ,such as the static path of nginx
    'url_prefix': '/static',


    /** use spritesmith for css-img sprite
     * 基于spritesmith实现, 详细参见https://github.com/Ensighten/spritesmith
     * 传递自动生成雪碧图的spritesmit的options
     **/
    //'spritesmith': { },保持默认即可
    
    /** usemin config 配置usemin,保持默认即可 **/
    // 'usemin': {}


    // 模块COMPONENTS目录，同一个模块的html和资源文件在一起。默认 'components'即可
    'components': 'components',

    // develop和publish下的views目录，跟服务端框架的views目录配置一致，比如express
    'runtime_views': 'views',
    'dist_views': 'views_dist',

    // develop和publish下的assets静态目录，跟服务器配置有关，比如nginx的static目录指向，请保持与服务器设定一致。支持多级路径设定，比如assets/public
    'runtime_assets': 'assets',
    'dist_assets': 'assets_dist',

    // 第三方JS类库、模块的目录，推荐设置为`lib`或`bower_components`（这样bower可以直接安装到这个目录）
    // 这个目录默认打包时为全局模块目录，可以直接`import xxx from 'xxx'`，而不用加相对路径
    // the js library dir, set as a global module. Also you can set as bower_components
    'lib': 'lib', 

    // 可以添加一个自定的全局模块目录，该目录下的js模块，也作为全局模块来require，不需要相对路径。
    // the global module dir
    'global': 'common' 
})


```

###2. 如何更好的配置CDN

* `cdn_prefix`支持 字符串、数组、函数
* 如果传入数组，那么按照随机来分配
* 如果传入函数，函数会获1个参数，`mediaFile`, 就是当前被css或html中引用到的资源文件名，可以根据文件名做cdn分配

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
        // 你自可以自实现分配策略
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

# clean 清理构建输出的目录和文件，包括自文件夹/目录
gulp gm:clean-deep

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



###12. Require CSS in js
* 直接在js中require你的css文件（源文件时scss文件）
* The CSS contents will be packaged into js files, and automatically injected to html when page opend. Using style tag
* 使用时要确保添加 .css 扩展名
* 举例: `require('./style.css')` or `import style from './style.css'`


###13. 如何启用karma单元测试
* 初次使用先安装，运行`gulp gm:karma:install`，会安装依赖和生成`karma.conf.js`文件
* 在您的components中的对应模块目录下，建立一个spec文件夹，将对应的spec文件放在里面，文件拓展名是.es6
* 运行 `gulp gm:karma:start` 来启动单元测试(watch模式)，将会运行各spec文件，完成后可在生成的coverage文件夹中查看覆盖率结果
* 指定spec目录、browsers等karma的选项，可以在`karma.conf.js`中设置、定制等



###教程
[浏览教程链接](http://karat.cc/article/56a351c3e48d2d05682aa0ac "karat.cc")

###License
MIT
