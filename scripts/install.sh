#!/bin/sh

echo "\n\n*Check whether the gulp is installed in global:"

gulp -v >& /dev/null

if [ $? -eq 0 ];then
    echo "\n*gulp has been installed"
else
    echo "\n*gulp not installed, now install gulp -g"
    npm install gulp -g
fi


echo "\n\n*Check whether the cnpm is installed:"

cnpm >& /dev/null

if [ $? -eq 0 ];then
    echo "\n*cnpm has been installed"
else
    echo "\n*cnpm not installed, now install cnpm -g"
    npm install -g cnpm --registry=https://registry.npm.taobao.org
fi

echo "\n*Now install gulp-sass by cnpm"
cnpm install gulp-sass

if [ $? -eq 0 ];then
    echo "'\n\n*Install gulp-sass Completed!"
else
    echo "\n\n*Install gulp-sass Failed! \n*You need install gulp-sass manually!"
fi


echo "\n\nGulpman Install Succeed!\nNow you can use the gulpman module in your gulpfile.js'"

echo "\n\n*some features:\nmodular structure\nauto progresss\nscss\nes6\nupdate browserify\njs/css/image minify\nmd5 filename"

echo "\n\n*Useful API:\n1. gulpman.publish\n2. gulpman.develop\n3. gulpman.clean\n4. gulpman.compile\n\n"

