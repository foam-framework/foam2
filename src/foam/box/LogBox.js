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
  package: 'foam.box',
  name: 'LogBox',
  extends: 'foam.box.ProxyBox',

  documentation: 'Log input messages before passing to optional delegate.',

  requires: [ 'foam.log.LogLevel' ],

  imports: [
    'debug',
    'log',
    'info',
    'warn',
    'error'
  ],

  properties: [
    {
      class: 'String',
      name: 'name',
      factory: function() { return `LogBox${this.$UID}`; },
      swiftFactory: 'return "LogBox$"+UUID().uuidString',
    },
    {
      class: 'FObjectProperty',
      of: 'foam.log.LogLevel',
      name: 'logLevel',
      factory: function() { return this.LogLevel.INFO; },
      swiftFactory: 'return LogLevel.INFO',
    }
  ],

  methods: [
    {
      name: 'send',
      code: function(message) {
        var output = message.object;
        this[this.logLevel.consoleMethodName].apply(this, [
          this.name,
          output instanceof Error ? output.toString() :
            foam.json.Pretty.stringify(message)
        ]);
        this.delegate && this.delegate.send(message);
      },
      swiftCode: `
let output = msg.object;
/*
let logMethod = get(key: logLevel.consoleMethodName) as? (String) -> Void
logMethod([
  name,
  output is Error ? (output as! Error).description : msg.toString()
].join(" "))
*/
try delegate.send(msg)
      `,
    },
  ]
});
