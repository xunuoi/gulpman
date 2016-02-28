'use strict';

var path = require('path');
var gutil = require('gulp-util');
var through = require('through2');

var gmutil = require('./gmutil');


function plugin(options) {
  var renames = [];
  var cache = [];

  options = options || {};

  if (!options.canonicalUris) {
    options.canonicalUris = true;
  } 

  options.replaceInExtensions = options.replaceInExtensions || ['.js', '.css', '.html', '.hbs'];

  // @debug add for gulpman
  options.prefix = options.prefix || '';
  options['_prefix'] = options['prefix']
  options['_all_prefix'] = new Set()
  

  // @add prefix array and fn support
  // @Lucas
  if(typeof options.prefix == 'string'){
    options['_all_prefix'].add(options.prefix)
  }else if(options.prefix instanceof Array){
    // 虽然在gulpman/index中已经做了proxy，但是目前注释掉这块，会导致/http://xx的问题，需要处理下
    Object.defineProperty(options, 'prefix',{
        get: function () {
            var p =  this['_prefix'][gmutil.randomNum(0, options['_prefix'].length-1)]

            options['_all_prefix'].add(p)

            return p
        },
        set : function (val) {
            this['_prefix'] = val
        },
        configurable : true
    })
  // if the param is a function
  }else if(options.prefix instanceof Function){
    Object.defineProperty(options, 'prefix',{
        get: function () {
            var p = this['_prefix'](options['_tmpMediaFilePath'], options['_tmpMediaFilePath'])

            options['_all_prefix'].add(p)

            return p;

        },
        set : function (val) {
            this['_prefix'] = val
        },
        configurable : true
    })
  }else {
    // default
  }


  return through.obj(function collectRevs(file, enc, cb) {
    if (file.isNull()) {
      this.push(file);
      return cb();
    }

    if (file.isStream()) {
      this.emit('error', new gutil.PluginError('gulp-rev-replace', 'Streaming not supported'));
      return cb();
    }


    // 此处file是宿主文件
    options['_file'] = file

    // Collect renames from reved files.
    if (file.revOrigPath) {

      // @add for gulpman hooks
      options['_tmpHostFilePath'] = file.path

      var mediaFilePath = fmtPath(file.revOrigBase, file.revOrigPath)
      
      // media file ,js css,egg.
      options['_tmpMediaFilePath'] = mediaFilePath

      // 此处触发一次运行函数
      var availablePrefix = options.prefix

      renames.push({
        unreved: mediaFilePath,
        reved: availablePrefix + fmtPath(file.base, file.path)
      });
    }

    if (options.replaceInExtensions.indexOf(path.extname(file.path)) > -1) {
      // file should be searched for replaces
      cache.push(file);
    } else {
      // nothing to do with this file
      this.push(file);
    }

    cb();
  }, function replaceInFiles(cb) {
    var stream = this;

    if (options.manifest) {
      // Read manifest file for the list of renames.
      options.manifest.on('data', function (file) {
        
        var manifest = JSON.parse(file.contents.toString());


        Object.keys(manifest).forEach(function (srcFile) {

          // @add for gulpman hooks
          var unrevedFilePath = canonicalizeUri(srcFile)

          options['_tmpMediaFilePath'] = unrevedFilePath

          if(options['_file']){
            options['_tmpHostFilePath'] = options['_file'].path
          }

          // 此处每次get prefix，都会运行一次产生函数,每次结果可能不同
          var availablePrefix = options.prefix
          
          renames.push({
            unreved: unrevedFilePath,
            reved: availablePrefix + canonicalizeUri(manifest[srcFile])
          });

        });
      });

      options.manifest.on('end', replaceContents);
    }
    else {
      replaceContents();
    }

    function replaceContents() {
      renames = renames.sort(gmutil.byLongestUnreved);

      // Once we have a full list of renames, search/replace in the cached
      // files and push them through.
      cache.forEach(function replaceInFile(file) {
        var contents = file.contents.toString();

        renames.forEach(function replaceOnce(rename) {
          var unreved = options.modifyUnreved ? options.modifyUnreved(rename.unreved) : rename.unreved;
          var reved = options.modifyReved ? options.modifyReved(rename.reved) : rename.reved;

          contents = contents.split(unreved).join(reved);

          options['_all_prefix'].size && options['_all_prefix'].forEach((availablePrefix)=>{
              // add for gulpman hooks
              // 这块需要遍历所有prefix,每次prefix可能会变，导致替换失败
              if (availablePrefix) {
                contents = contents.split('/' + availablePrefix).join(availablePrefix + '/');
              }
          })

        });

        file.contents = new Buffer(contents);
        stream.push(file);
      });

      cb();
    }
  });


  function fmtPath(base, filePath) {
    var newPath = path.relative(base, filePath);

    return canonicalizeUri(newPath);
  }


  // 标准化url
  function canonicalizeUri(filePath) {
    if (path.sep !== '/' && options.canonicalUris) {
      filePath = filePath.split(path.sep).join('/');
    }

    return filePath;
  }

}


/**
 * Export API
 * @type {[type]}
 */

module.exports = plugin;
