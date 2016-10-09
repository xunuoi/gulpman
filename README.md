
[![Coverage Status](https://raw.githubusercontent.com/xunuoi/gulpman/master/assets/logo.png)](http://karat.cc/article/56a351c3e48d2d05682aa0ac/)

-----

[![NPM version](https://img.shields.io/npm/v/gulpman.svg?style=flat-square)](http://badge.fury.io/js/gulpman)
<img src="https://raw.githubusercontent.com/xunuoi/gulpman/master/assets/build.png?style=flat-square" width="90" alt="Build status" />


# gulpman

[浏览简体中文文档](https://github.com/xunuoi/gulpman/blob/master/README_zh-CN.md)

- Create Modular Front-End Build System, based on gulp , more light and easier than FIS!
- Component Oriented Solution, based on `gulp`. More simple, flexible, expandable and stable than `FIS`. Everyone know gulp can do secondary development.
- Support `base64` image in `html/CSS`
- Support `JS/CSS` inlnied in html
- Support `require('main.css')`, require css file in js
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
- Required Node >= 4.0.0
- *For npm >= 3, after run `npm install`, please manually install `gulp-sass`, `babel-preset-es2015`, `babel-preset-react`, `browserify-css`


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

// your other tasks ...
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

###3. About `is_absolute`

* `is_absolute` is the dist path of source in html. default true. the dist path is like `/static/home/main.js`

* [*]Need consistent config with Server, like nginx, apache

* If no local server, you can set is_absolute as false, use relative path. Like `../../assets/static/home/main.js`


###4. gulpman directory

* Use gulpman to arrange your directory as component，The root component dir can be`./components`(default). If you have one component named foo, then `./components/foo`，all related assets such as `html|js|css|fonts|image` should be put in `foo` folder.

* This solution for assets can be high efficiency and easy to maintain.

* `gm:develop` to start `develop` mode, the `views` dir and `assets` dir can be generated automatically

* `gm:publish` to publish assets in production env. The `views_dist` and `assets_dist` can generated.


###5. What is global directory

- For `Browserify` packing, the js module in `global dir` can be directly `require` or `import` in es6/js code

- In `gulpman.config`, the `lib`和`global` are global directory. Take an example:
* In `components/lib` directory, you have one module `foo.js`，then it is `components/lib/foo.js`. So when you use foo in your es6 file, you can use it like: `import foo from 'foo'`, no need write as `import foo from '../lib/foo'`

- similarly, `global` option can set your dir as global module dir. You can set `bower` dir as your `lib` dir.

- Please make no conficts in your global dir


###6. Support for complex and multi level directory in config

* Such as:

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


##Usage

###1. CLI run Task:

```Shell

# Create components directory and add one demo
# init components dir and a html demo
gulp gm:init


# develop and watch mode，watchings files changes and update files
gulp gm:develop

# Watch one special component
gulp gm:develop -c component_name


# publish assets in production env
gulp gm:publish

# publish command support `-a`和`-v` parameters to set output assets/views path.
gulp gm:publish -v your_views_dist -a your_assets_dist

# clean dist files
gulp gm:clean

# Generate one developing assets/views files, but not in watching mode
# compile for develop, not watch
gulp gm:compile

```


###2. Watch one special component in development

* When the project become huge, if we watch all components assets, it will be low efficiency，so we can use gulpman to watch special component to get better performance

* Fox example, if we want watch the `home` component:

```Shell

gulp gm:develop -c home

```


###3. Use `React` in gulpman
* Install React: `npm install react react-dom`
* Use React in ES6:

```Javascript
import React from 'react';
import ReactDOM from 'react-dom';

// xxx
```


###4. Use `tpl` file in js|es6|jsx

* Support `.tpl` file, it will be packaged in dist js files.

* Usage: `import dialogTpl from './dialog.tpl'` or `var dialogTpl = require('./dialog.tpl')`



###5. Usge base64 img in HTML/CSS

* Just add `?_gm_inline` in assets src path in html/css
* The `base64` code will be inlined in html/css


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


###6. Use inlined CSS/JS in html by querystring

* Like base64, just add `?_gm_inline` in url path

```html
<script src="./plugin.js?_gm_inline" type="text/javascript"></script>

<link href="./dialog.css?_gm_inline" rel="stylesheet" type="text/css" >
```

* The inlined sources will be auto updated when source files changed.


###7. Use Sprite img in css

* Based on spritesmith, you can transport usemin opts in gulpman.config.
* More detail about Spritesmith: [https://github.com/Ensighten/spritesmith](https://github.com/Ensighten/spritesmith)
* Usage: In scss file, just add `?_gm_sprite` to img url

```css
.demo {
    background: url(./img/abc.png?_gm_sprite) no-repeat;
    
    /* other style you can set ...*/
    width: 50px;
    height: 50px;
}
```

###8. Use Usemin

* You can tranport usemin opts in gulpman.config
* More detail about usemin: [https://github.com/zont/gulp-usemin](https://github.com/zont/gulp-usemin)
* Uage: just add usemin build comments in html. Support `js`|`css`|`inlinejs`|`inlinecss` syntax
* Note: Just write relative path in usemin build comment. Then gulpman can calculate absolute path for assets.
* If you don't write output path, the gulpman will combo one new ouput file name automatically.


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


###9. Use js tpl template
* Put the `.tpl` files in your component, and use `require` or `import` in ES6, then the tpl files will be packaged in js files.
* All tpl will be convertd to text string into js files.
*  Base64 img and CSS/JS Embed are supported in Tpl

- import tpl in es6
```js
    import dialogTpl from './dialog.tpl'
```

- require
```js
    var dialogTpl = require('./dialog.tpl')
```

###10. Use iconfont convert svg to fontface
* Convert SVG to icon-font, use `@font-face` in css
* Run `gulp gm:iconfont:install` before first running
* Put the svg files in `components/iconfonts/source` directory, then run `gulp gm:iconfont` to begin start convert
* The icon-font and css will generated in `iconfonts/gmicon` folder


###11. Support LAB.js to load async js
* Add LAB.js in your project
* Use LAB API to load js, use `relative path`
* Example: `$LAB.script("../testload/test.js").wait(()=>{console.log('test loaded')})`


###12. Require CSS in JS
* Require css files in your es6/js files
* The CSS contents will be packaged into js files, and automatically injected to html when page opend. Using style tag
* Should keep the .css extname
* Example: `require('./style.css')` or `import style from './style.css'`


###13. Use karma to do Unit Test
* Run `gulp gm:karma:install` before first running, it will install dependencies and generate `karma.conf.js`.
* In your one component folder, create one folder named `spec`, then put your spec es6 files in the `spec` folder, the file extname must be `.es6`
* Run `gulp gm:karma:start` in CLI to start Karma Unit Test, you can view the coverage result in `coverage` foloder
* Set one special spec folder、browsers and other karma options, you can set them in `karma.conf.js`



###Tutorial
[Tutorial Link](http://karat.cc/article/56a351c3e48d2d05682aa0ac "karat.cc")

###License
MIT
