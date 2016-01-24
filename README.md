# gulpman
Create Modular Front-End Build System, based on gulp ,easy useage


###Install
cd into your project dir and install:

`npm install gulpman --save-dev`



###Usage

####In Your gulpfile:

```Javascript
/**
 * Gulpfile.js
 */


var gulp = require('gulp'),
    gman = require('gulpman')


// your other tasks ...
// xxx ...yyy


// if you want to set the dir, you can use config API:

gman.config({
    // if set the assets url prefix as absolute or relative, default: true
    'is_absolute': true,

    'cdn_prefix': '', // cdn prefix,

    // usually set as /static, this involves the server config ,such as the static path of nginx
    'url_prefix': '/static' 

    // set some path/dir:

    'components': 'components',

    'runtime_views': 'views',
    'dist_views': 'views_dist',

    'runtime_assets': 'assets',
    'dist_assets': 'assets_dist',

    // the js library dir, set as a global module. Also you can set as bower_components
    'lib': 'lib', 

    // the global module dir
    'global': 'common' 
})


```

####In Your CLI:

```Shell

# init components dir and a html demo
gulp gm:init

# publish 
gulp gm:publish

# develop and watch
gulp gm:develop

# clean
gulp gm:clean

# compile for develop,not watch
gulp gm:compile


```
