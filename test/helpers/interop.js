var GLOBAL = global || this;
var NODEJS = typeof module !== 'undefined' && module.exports;

if (NODEJS) require('es6-shim');

// TODO(markdittmer): Make the non-NodeJS case match with wherever we expect
// Jasmine's SpecRunner.html.
var SRC_DIR = NODEJS ? process.cwd() + '/src' : 'src';

GLOBAL.loadSrcScript = function(path) {
  return new Promise(function(resolve, reject) {
    if (NODEJS) {
      var requirePath  = SRC_DIR + '/' + path;
      var success = true;
      try {
        require(requirePath);
      } catch (e) {
        success = false;
        reject(e);
      }
      if (success) resolve();
    } else {
      var document = GLOBAL.document;
      var script = document.createElement('script');
      script.addEventListener('load', function() { resolve(); });
      script.addEventListener('error', function() { reject(); });
      script.setAttribute('src', SRC_DIR + '/' + path + '.js');
      document.head.appendChild(script);
    }
  });
};

GLOBAL.readSrcFile = function(path, callback) {
  return new Promise(function(resolve, reject) {
    if (NODEJS) {
      var fileContents = require('fs').readFileSync(SRC_DIR + '/' + path);
      resolve(fileContents);
    } else {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', SRC_DIR + '/' + path);
      xhr.addEventListener('load', function() { resolve(xhr.responseText); });
      xhr.addEventListener('error', function(error) { reject(error); });
      xhr.send();
    }
  });
};

var coreFileNamesPromise = NODEJS ?
    GLOBAL.readSrcFile('core.json').then(function(coreFilesJSON) {
      return JSON.parse(coreFilesJSON);
    }) :
    Promise.resolve(); // TODO: currently web mode requires manual script tag inclusion

GLOBAL.loadCoreTo = NODEJS ?
function(lastCoreFileName) {
  return coreFileNamesPromise.then(function(coreFileNames) {
    var cont = true;
    return coreFileNames.reduce(function(promise, coreFileName) {
      if (!cont) return promise;
      promise = promise.then(GLOBAL.loadSrcScript(coreFileName));
      if (coreFileName === lastCoreFileName) cont = false;
      return promise;
    }, Promise.resolve());
  });
} :
function() { return Promise.resolve(); }; // TODO: currently web mode requires manual script tag inclusion
