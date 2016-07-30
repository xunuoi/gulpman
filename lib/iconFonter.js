// Copyright (c) 2015 App Annie Inc. All rights reserved.
'use strict';

var iconfont = require('gulp-iconfont');
var iconfontCss = require('gulp-iconfont-css');
var path = require('path'),
    j = path.join;

var sh = require("shelljs")

var fontName = 'gmicon';

function registerTask(gulp, opts) {
    var runTimestamp = Math.round(Date.now() / 1000);

    if(!opts['iconfont']) {
        opts['iconfont'] = {

        }
    }
    var _iconConf = opts['iconfont'];
    
    var svgSource = _iconConf['source'] || j(opts['components'], 'iconfonts/source')
    var iconPath = _iconConf['icon'] || j(opts['components'], 'iconfonts', fontName)
    // var iconCSSPath = _iconConf['css'] || j(opts['components'], 'iconfonts')
    var iconUrl = j('./', fontName)
    var svgSource = j(svgSource, '/*.svg');

    gulp.task('gm:iconfont', function() {

        return gulp.src(svgSource)
            .pipe(iconfontCss({
              fontName: fontName,
              // path: 'app/assets/css/templates/_icons.scss',
              targetPath: j('gmicon.css'),
              fontPath: iconUrl,
              cssClass: 'gmicon'
            }))
            .pipe(iconfont({
                fontName: fontName, // required
                formats: ['svg', 'ttf', 'eot', 'woff', 'woff2'],
                normalize: true,
                fontHeight: 500,
                timestamp: runTimestamp  // recommended to get consistent builds when watching files
            }))
            .pipe(gulp.dest(iconPath))
    });
}

exports.registerTask = registerTask;
