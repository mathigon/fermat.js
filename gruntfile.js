// =============================================================================
// fermat.js | Grunt Configuration
// (c) 2016 Mathigon
// =============================================================================


const fs  = require('fs');
const path = require('path');
const grunt = require('grunt');
const rollup = require('rollup');


const absolutePath = /^(?:\/|(?:[A-Za-z]:)?[\\|\/])/;
const paths = ['assets', '../core.js/src', '../fermat.js/src', '../boost.js/src', '../slate.js/src'];
const cache = {};

function exists(path) {
  try {
    fs.accessSync(path);
    return true;
  } catch(e) {
    return false;
  }
}

function last(array) {
  return array[array.length - 1];
}

function resolveId(importee, importer) {
  // disregard relative paths, absolute paths, and entry modules
  if (importee[0] === '.' || absolutePath.test(importee) || !importer) return null;

  if (importee in cache) return cache[importee];

  for (let p of paths) {
    let testPath = path.join(__dirname, p, importee)  + '.js';
    if (exists(testPath)) return testPath;

    let folder = last(importee.split('/'));
    testPath = path.join(__dirname, p, importee, folder)  + '.js';
    if (exists(testPath)) return testPath;
  }

  return null;
}

grunt.registerMultiTask('rollup', 'Rollup Grunt Plugin', function() {

  let done = this.async();
  let options = this.options({ module: function() { return 'app'; } });

  let promises = this.files.map(function(f) {
    if (f.src.length === 0) grunt.fail.warn('No entry point specified.');
    if (f.src.length > 1) grunt.fail.warn('Multiple entry points are not supported.');

    let entry = f.src[0];
    if (!grunt.file.exists(entry)) grunt.fail.warn('Entry point "' + entry + '" not found.');

    return rollup.rollup({
      entry: entry,
      plugins: [{ resolveId }]
    }).then(function(bundle) {
      let result = bundle.generate({format: 'es6'});
      grunt.file.write(f.dest, result.code);
    });
  });

  Promise.all(promises)
    .then(done)
    .catch(grunt.fail.warn);
});


grunt.initConfig({
  rollup: {
    tests: {
      files: [{
        expand: true,
        cwd: 'tests',
        src: '*.js',
        dest: 'build'
      }]
    }
  },

  nodeunit: {
    tests: ['build/*.js'],
  },

  clean: {
    tests: ['build']
  }

});

grunt.loadNpmTasks('grunt-contrib-clean');
grunt.loadNpmTasks('grunt-contrib-nodeunit');
grunt.registerTask('test', ['rollup', 'nodeunit', 'clean']);
