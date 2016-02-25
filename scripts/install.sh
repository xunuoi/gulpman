#!/bin/sh

echo "\n\n*Check whether the gulp is installed in global:"

gulp -v >/dev/null 2>&1

if [ $? -eq 0 ];then
    echo "\n*gulp has been installed"
else
    echo "\n*gulp is not installed, now install gulp"
    npm install --global gulp-cli
fi


# change dir to install local gulp
cd ../..
npm install gulp --save-dev
# install babel preset
npm install babel-preset-es2015 --save
npm install babel-preset-react --save
cd -
echo "\n*Install local gulp Completed!\n"


# check if the user want use cnpm. Chinese Mainland Recommend

while :  # loop
do
if read -t 3 -n 1 -p "*Do you want install cnpm ?(Mainland China Recommend) [Y/N]:"  #limited time 5s  
    then
        case $REPLY in
            Y|y) #Y
                Install_Type=1;
                echo "\n*Install cnpm [default]"
                break
                ;;
            N|n) #N
                Install_Type=0;
                echo "\n*Not install cnpm"
                break
                ;;
            *) #input error repeat
                echo "\n**Please input right params ! [Y] or [N] \n"
              continue
        esac 
else #timeover

    Install_Type=1;
    echo "\n*Install cnpm [default]"
    break
fi 
done

# echo 'Type: ' $Install_Type

# check if need install cnpm and do it
if [ $Install_Type -eq 1 ];then
    # for cnpm
    echo "\n\n*Check whether the cnpm is installed:"

    cnpm >/dev/null 2>&1

    if [ $? -eq 0 ];then
        echo "\n*cnpm has been installed"
    else
        echo "\n*cnpm not installed, now install cnpm -g"
        npm install -g cnpm --registry=https://registry.npm.taobao.org
    fi

fi



# for gulp-sass
echo "\n*Now install gulp-sass by cnpm:"

if [ $Install_Type -eq 1 ];then

    echo "\n*Install gulp-sass by {cnpm} [default]"
    cnpm install gulp-sass --save-dev
else
    echo "\n*Install gulp-sass by {npm}"
    npm install gulp-sass --save-dev
fi

# check whether the gulp-sass install succeed
if [ $? -eq 0 ];then
    echo "'\n\n*Install gulp-sass Completed!"
else
    echo "\n\n*Install gulp-sass Failed! \n*You need install gulp-sass manually!"
fi



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

