#!/bin/sh

echo "\n\n*Check whether the gulp is installed in global:"

gulp -v >& /dev/null

if [ $? -eq 0 ];then
    echo "\n*gulp has been installed"
else
    echo "\n*gulp not installed, now install gulp -g"
    npm install gulp -g
fi


if [ $? -eq 0 ];then
    echo "'\n\n*Install gulp Completed!"
else
    echo "\n\n*Install gulp Failed! \n*You need install gulp manually!\n\n"
fi
