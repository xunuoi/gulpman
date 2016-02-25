
[![Coverage Status](https://raw.githubusercontent.com/xunuoi/gulpman/master/assets/logo.png)](http://karat.cc/article/56a351c3e48d2d05682aa0ac/)

-----

[![NPM version](https://img.shields.io/npm/v/gulpman.svg?style=flat-square)](http://badge.fury.io/js/gulpman)
<img src="https://raw.githubusercontent.com/xunuoi/gulpman/master/assets/build.png?style=flat-square" width="90" alt="Build status" />
<img src="https://raw.githubusercontent.com/xunuoi/gulpman/master/assets/coverage.png?style=flat-square" width="106" alt="Coverage Status" />


# gulpman

- Create Modular Front-End Build System, based on gulp , more light and easier than FIS!
- 基于gulp的前端组件化、模块化解决方案，比百度FIS更简单、灵活、可控性高，会gulp就会定制自己的方案
- 支持图片base64方式嵌入到html/CSS
- 支持JS/CSS内联方式嵌入html文件
- 整合spritesmith，简单生成sprite雪碧图
- 集成`SCSS|ES6|ReactJS|Babel|Browserify|cssnano|uglify|imagmein`等常用组件，做到一站式自动化解决方案，同时清晰、可控，定制、修改都超简单
- 扩展性高，gulp现有的插件都可以拼装、加入到gulpman中使用，你可以自己根据实际情况组合、修改，比如可以轻松整合browser-sync到构建系统中。



##Introduction 说明
- 支持Mac、Linux环境下安装、使用
- Windows环境未做完整安装测试，由于安装脚本使用到shell，windows不支持shell，执行完`npm install gulpman --save-dev`后，可能需要手动安装`gulp`、`gulp-sass`模块
- 如果手动安装`gulp-sass`,建议使用淘宝的`cnpm`来完成，避免国内网络导致`npm`安装失败
- Node版本需要不低于4.2.0，如果要兼容0.1x的旧版本nodejs，请考虑修改或转换`index.js`、`lib`等目录和文件中源码的ES6语法


##Install 安装
* cd into your project dir and install: `npm install gulpman --save-dev`
* 安装中若npm报出目录权限导致的error，比如涉及到`/usr/local/lib/node_modules`权限的报错，请请检查其权限是否正常并用chown来修复，将拥有者修改为当前登录用户即可。
* 可以使用 `sudo chown -R "$(whoami)"`+`路径`
* 不要使用`sudo npm install`来手工安装因为权限问题而失败的模块。请修改权限后，再用`npm install`来安装即可
* 如果你本地node和npm的安装和权限正常，那gulpman的安装过程应该都是顺利和成功的。



##Config 配置

###0. 支持自动模式，无需配置即使用

* 可直接跳过`Config 配置`处的说明，直接去看`Usage 使用`


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
 * 设置路径、CDN、资源URL前缀等，API超级简单
 */

gman.config({
    
    // 是否使用绝对路径，默认值true, 推荐使用，方便服务器配置。比如`/static/home/main.js`这种风格。

    // 如果无服务端情况下，本地调试，推荐设置is_absolute为false, 那么会是类似`../../assets/static/home/main.js`这种风格。
    这种情况直接打开html文件就可以正常浏览和运行！

    // `is_absolute` 具体取决于项目情况、服务端配置等。
    // if set the assets url prefix as absolute or relative, default: true
    'is_absolute': true,

    // cdn prefix 配置CDN
    'cdn_prefix': '', // 支持 字符串/数组/函数

    // 配置资源URL前缀，建议 /xxx这种
    // usually set as /static, this involves the server config ,such as the static path of nginx
    'url_prefix': '/static' 


    // use spritesmith for css-img sprite
    // 基于spritesmith实现, 详细参见https://github.com/Ensighten/spritesmith
    // 传递自动生成雪碧图的spritesmit的options
    'spritesmith': { }


    // 模块COMPONENTS目录，同一个模块的html和资源文件在一起。默认 'components'即可
    'components': 'components',

    // develop和publish下的views目录，跟服务端框架的views目录配置一致，比如express
    'runtime_views': 'views',
    'dist_views': 'views_dist',

    // develop和publish下的assets静态目录，跟服务器配置有关，比如nginx的static目录指向
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
* 如果传入函数，函数会获得两个参数，`mediaFile`和`hostFile`
* `hostFile`是当前正在处理的html/CSS文件
* `mediaFile`是指在`hostFile`中被引用的资源文件

```Javascript

'cdn_prefix': function (mediaFile, hostFile) {
        
        gulpman.util.warn(mediaFile)
        gulpman.util.warn(hostFile)

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

# 编译输出一份运行时资源文件，但是不进入监视状态
# compile for develop, not watch
gulp gm:compile

```


###2. 如何在gulpman架构下使用React

* 方法一：通过script标签引入React类库到HTML (推荐)

```html
<script type="text/javascript" src="./lib/react-0.14.6/build/react.min.js"></script>
<script type="text/javascript" src="./lib/react-0.14.6/build/react-dom.min.js"></script>
```

* 方法二：直接在ES6/JSX文件中引入React模块

注意：引入的react文件是为Gulpman预置的，已经修改过来兼容browserify，从而在window中暴露React和ReactDOM对象供开发者调用：

```Javascript
import 'react'
```



###3. 开发中只监视某个component目录

* 随着项目变大，开发中如果全局监视所有component资源，效率将会降低，因此可使用gulpman提供的监视子component的方式来开发，提高性能

* 比如说，只监视components目录下的home模块：

```Shell

gulp gm:develop -c home

```


###4. 如何在HTML/CSS中嵌入base64编码的图片

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

###5. 如何在HTML中嵌入内联CSS/JS

* 类似图片base64,只需要资源后面添加`?_gm_inline`即可

```html
<script src="./plugin.js?_gm_inline" type="text/javascript"></script>

<link href="./dialog.css?_gm_inline" rel="stylesheet" type="text/css" >
```

* 注：所有内嵌嵌入的资源，包括图片/JS/CSS，在develop(监视)模式下，都已自动关联更新。即如果a.html文件中，内联嵌入了一个b.css，如果b.css发生了修改，那么a.html会自动编译更新。


###6. 如何使用Sprite雪碧图

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


###教程
[浏览教程链接](http://karat.cc/article/56a351c3e48d2d05682aa0ac "karat.cc")

###License
MIT
