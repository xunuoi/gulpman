
var sh = require('shelljs')
console.log('now install')

sh.exec('npm install -g cnpm --registry=https://registry.npm.taobao.org')

sh.exec('cnpm install gulp-sass --save')


console.log('\nInstall Completed!\nGulpman Install Succeed!\nNow you can use the gulpman module in your gulpfile.js')