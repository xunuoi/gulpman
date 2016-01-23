# gulpman
Create Modular Front-End Build System, based on gulp ,easy useage


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
    'components': 'components',

    'runtime_views': 'views',
    'dist_views': 'views_dist',

    'runtime_assets': 'assets',
    'dist_assets': 'assets_dist',

    'lib': 'lib', // the js library dir, set as a global module. Also you can set as bower_components

    'global': 'common' // the global module dir,

    'cdn_prefix': '', // cdn prefix,

    'url_prefix': '/static' // usually set as /static, this involves the server config ,such as the static path of nginx
})


```

####In Your CLI:

```Shell
# publish
gulp gm:publish

# develop and watch
gulp gm:develop

# clean
gulp gm:clean

# compile for develop,not watch
gulp gm:compile


```
