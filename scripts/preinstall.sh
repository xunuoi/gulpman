#!/bin/sh

# init the package.json if not existed
packageFile="../../package.json"
Install_Type=1

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

# check if need install cnpm and do it     
 
# for cnpm        
echo "\n\n*Check whether the cnpm is installed:"      
  
cnpm >/dev/null 2>&1      
  
if [ $? -eq 0 ];then      
    echo "\n*cnpm has been installed"     
else      
    echo "\n*cnpm not installed, now install cnpm -g"     
    npm install -g cnpm --registry=https://registry.npm.taobao.org        
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
