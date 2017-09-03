#!/bin/sh

# @author: Lucas
# @mail: xwlxyjk@gmail.com


# init the package.json if not existed
packageFile="../../package.json"

if [ ! -f "$packageFile" ]; then
    cp ./scripts/package.json ../../
fi



echo "\n\n*Check whether the gulp is installed in global:"

gulp -v >/dev/null 2>&1

if [ $? -eq 0 ];then
    echo "\n*gulp has been installed"
else
    echo "\n*gulp is not installed, now install gulp"
    npm install --global gulp-cli
fi

# npm rm --global gulp
# npm install --global gulp-cli


# change dir to install local gulp
cd ../..
echo "\n*Now Install Local gulp: \n"
npm install gulp --save-dev
echo "\n*Install local gulp Completed! \n"

echo "\n*Now Install the babel preset \n"
# install babel preset
npm install babel-preset-es2015 --save
npm install babel-preset-react --save
npm install browserify-css --save
cd -

# copy gulpfile.js if not exist
script_dir=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )

gulpfile_src="gulp/gulpfile.js"

gulpfile_path="../../gulpfile.js"


if [ ! -f "$gulpfile_path" ]; then
    cp $script_dir/$gulpfile_src $gulpfile_path
    echo "\n*Generated gulpfile.js Into CWD\n"
fi


echo "\n\n\n\n\n\n     ======= * ======="

echo "\n\nGulpman Install Succeed!\nNow you can use the gulpman module in your gulpfile.js'"

echo "\n\n*some features:\nmodular structure\nauto progresss\nscss\nes6\nReact\nupdate browserify\njs/css/image minify\nrev-md5"

echo "\n\n*API Detail: https://github.com/xunuoi/gulpman"
echo "\n*Any Question: \n  xunuoi@163.com\n  xwlxyjk@gmail.com\n\n"

echo "     ======= * =======\n\n\n\n\n\n"


# Mac OS Inform
osascript -e 'display notification "Enjoy!" with title "Gulpman Install Succeed"' >/dev/null 2>&1

