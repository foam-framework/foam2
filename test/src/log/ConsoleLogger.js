/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

describe('ConsoleLogger', function() {
  var captureLogger;
  var testCtx;
  var LogLevel;
  var logLevels = [ 'debug', 'info', 'warn', 'error' ];

  beforeAll(function() {
    var path = require('path');
  });

  beforeEach(function() {
    foam.CLASS({
      package: 'foam.log.test',
      name: 'CaptureLogger',
      implements: [ 'foam.log.Logger' ],

      exports: [
        'debug',
        'log',
        'info',
        'warn',
        'error'
      ],

      properties: logLevels.map(function(name) {
        return {
          class: 'Array',
          name: name + 's',
        };
      }),

      methods: logLevels.map(function(name) {
        return {
          name: name,
          code: function() { this[name + 's'].push(Array.from(arguments)); },
        };
      }).concat([{
        name: 'clear',
        code: function() {
          var self = this;
          logLevels.forEach(function(name) { self[name + 's'] = []; });
        }
      }])
    });
    foam.CLASS({
      package: 'foam.log.test',
      name: 'ConsoleLogger',
      extends: 'foam.log.ConsoleLogger',

      properties: [
        ['getDateString', function() { return 'DATE'; }]
      ]
    });
    LogLevel = foam.lookup('foam.log.LogLevel');
    testCtx = foam.lookup('foam.log.test.ConsoleLogger').create(
      null,
      captureLogger =
          foam.lookup('foam.log.test.CaptureLogger').create()
    ).__subContext__;
  });

  it('should construct in default context', function() {
    expect(function() {
      foam.lookup('foam.log.ConsoleLogger').create();
    }).not.toThrow();
  });

  it('should output strings', function() {
    logLevels.forEach(function(logLevel) {
      testCtx[logLevel]('frobinator');
      expect(captureLogger[logLevel + 's']).toEqual([[
        LogLevel[logLevel.toUpperCase()].shortName, '[DATE]', 'frobinator'
      ]]);
      captureLogger.clear();
    });
  });

  it('should send "log" method to log level "info"', function() {
    testCtx.log('frobinator');
    expect(captureLogger.infos).toEqual([[
      LogLevel.INFO.shortName, '[DATE]', 'frobinator'
    ]]);
  });

  it('should output varied objects', function() {
    logLevels.forEach(function(logLevel) {
      var o = {};
      var fo = foam.core.FObject.create();
      var a = [o];
      testCtx[logLevel](a, o, fo, undefined, null, 'frobinator', true, 3.14);
      expect(captureLogger[logLevel + 's']).toEqual([[
        LogLevel[logLevel.toUpperCase()].shortName, '[DATE]',
        a, o, fo, undefined, null, 'frobinator', true, 3.14
      ]]);
      captureLogger.clear();
    });
  });
});
