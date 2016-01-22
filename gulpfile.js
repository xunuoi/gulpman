/**
 * TEST FOR GULPMAN
 */

var gulp = require('gulp'),
    gman = require('./index')


gulp.task('clean', ()=>{
    gman.clean()
})

gulp.task('publish', ()=>{
    gman.publish()
})

gulp.task('compile', ()=>{
    gman.compile()
})

gulp.task('develop', ()=>{
    gman.develop()
})