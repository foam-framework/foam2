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

foam.CLASS({
  package: 'foam.log',
  name: 'SimpleLogger',
  implements: [ 'foam.log.Logger' ],

  documentation: `Decorate contextual logging methods with log level (short
      name) and date string`,

  requires: [ 'foam.log.LogLevel' ],
  imports: [
    'debug as debug_',
    'log as log_',
    'info as info_',
    'warn as warn_',
    'error as error_',
  ],
  exports: [
    'debug',
    'log',
    'info',
    'warn',
    'error',
  ],

  properties: [
    {
      class: 'Function',
      name: 'debug',
      factory() { return this.put.bind(this, this.LogLevel.DEBUG); }
    },
    {
      class: 'Function',
      name: 'log',
      factory() { return this.put.bind(this, this.LogLevel.INFO); }
    },
    {
      class: 'Function',
      name: 'info',
      factory() { return this.put.bind(this, this.LogLevel.INFO); }
    },
    {
      class: 'Function',
      name: 'warn',
      factory() { return this.put.bind(this, this.LogLevel.WARN); }
    },
    {
      class: 'Function',
      name: 'error',
      factory() { return this.put.bind(this, this.LogLevel.ERROR); }
    },
    {
      class: 'Function',
      name: 'getDateString',
      factory() { return function() { return (new Date()).toString(); }; }
    }
  ],

  methods: [
    function put(logLevel) {
      var args = [ logLevel.shortName, '[' + this.getDateString() + ']' ]
          .concat(Array.from(arguments).slice(1));
      this[logLevel.consoleMethodName + '_'].apply(this, args);
    }
  ]
});
