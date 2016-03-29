// Deps for loading necessary files and running scripts in a browser-like
// environment.
var fs = require('fs');
var vm = require('vm');
//var jsdom = require('jsdom');

// Unique value for whitelisted keys in a property name map.
var WHITELISTED = {};

/**
 * Get a map of key-on-global-object => value-on-global-object.
 */
function getPropertyNameMap(obj) {
  var props = Object.create(null);
  do {
    var names = Object.getOwnPropertyNames(obj);
    for (var i = 0; i < names.length; i++) {
      if (!props[names[i]]) props[names[i]] = obj[names[i]];
    }
  } while (obj = Object.getPrototypeOf(obj));
  return props;
}

/**
 * Build a map of key-on-global-object => value-on-global-object
 * where key => WHITELISTED denotes keys that scripts under test
 * are allowed to change.
 */
function buildWhitelistMap(context, whitelist) {
  var props = getPropertyNameMap(context);
  for (var i = 0; i < whitelist.length; i++) {
    props[whitelist[i]] = WHITELISTED;
  }
  return props;
}

/**
 * Build a report on global context pollution of the following form:
 * {
 *   whitelistPresent: [whitelisted keys that show up in context],
 *   additions: [{
 *     key: key on context,
 *     value: value on context,
 *   }],
 *   modifications: [{
 *     key: key on context,
 *     old: value on context before script run,
 *     nu: value on context after script run,
 *   }],
 * }
 */
function buildContextReport(context, whitelistMap) {
  var rtn = {
    whitelistPresent: [],
    additions: [],
    modifications: [],
  };
  var contextMap = getPropertyNameMap(context);
  var key;
  for (key in contextMap) {
    if (key === 'NaN' && isNaN(contextMap[key]) &&
        isNaN(whitelistMap[key])) continue;
    if (whitelistMap[key] === WHITELISTED) {
      if (typeof contextMap[key] !== 'undefined') {
        rtn.whitelistPresent.push(key);
      }
    } else if (whitelistMap[key] !== contextMap[key]) {
      if (typeof whitelistMap[key] === 'undefined') {
        rtn.additions.push({ key: key, value: contextMap[key] });
      } else {
        rtn.modifications.push({
          key: key,
          old: whitelistMap[key],
          nu: contextMap[key],
        });
      }
    }
  }
  for (key in whitelistMap) {
    if (whitelistMap[key] === WHITELISTED) continue;
    if (typeof whitelistMap[key] !== 'undefined' &&
        typeof contextMap[key] === 'undefined') {
      rtn.modifications.push({
          key: key,
          old: whitelistMap[key],
          nu: undefined,
      });
    }
  }
  return rtn;
}

/**
 * Answer: Does any part of contextReport constitute a test failure?
 */
function isContextReportClean(contextReport) {
  return contextReport.additions.length === 0 &&
      contextReport.modifications.length === 0;
}


// describe('Global scope pollution', function() {
//   it('FOAM core does not pollute the global context', function(done) {
//     // Load global whitelist, list of core files, and core files.
//     var globalWhitelist =
//         JSON.parse(fs.readFileSync('test/node/globalWhitelist.json'));
//     var scriptFileNames = JSON.parse(fs.readFileSync('src/core.json'));
//     var coreScriptContents = '';
//     for (var i = 0; i < scriptFileNames.length; i++) {
//       coreScriptContents += fs.readFileSync('src/' + scriptFileNames[i]);
//     }
//     // Run in a browser-like environment, and evaluate changes to the global
//     // context.
//     jsdom.env(
//         '<html><head><title>Global Scope Pollution Test</title></head><body>' +
//             '</body></html>',
//         [],
//         [],
//         function(err, window) {
//           expect(err).toBeFalsy();
//
//           var context = vm.createContext(window);
//           context.console = console;
//           var whitelistMap = buildWhitelistMap(context, globalWhitelist);
//           vm.runInContext('global = undefined;window = this;' + coreScriptContents, context);
//           var report = buildContextReport(context, whitelistMap);
//
//           window.close();
//
//           if (!isContextReportClean(report)) {
//             console.log(report);
//             fail('Core should not pollute the global context; context report:\n' +
//                 JSON.stringify(report, null, 2));
//           }
//           expect(isContextReportClean(report)).toBe(true);
//           done();
//         });
//   });
// });
