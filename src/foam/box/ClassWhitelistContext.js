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
  name: 'ClassWhitelistContext',
  exports: [
    'lookup'
  ],
  properties: [
    {
      class: 'StringArray',
      name: 'whitelist'
    },
    {
      class: 'Map',
      name: 'whitelist_',
      expression: function(whitelist) {
        var w = {};
        for ( var i = 0 ; i < whitelist.length ; i++ ) {
          w[whitelist[i]] = true;
        }
        return w;
      },
      swiftExpressionArgs: ['whitelist'],
      swiftExpression: function() {/*
var w = [String:Bool]()
for i in whitelist {
  w[i] = true
}
return w
      */}
    }
  ],
  methods: [
    {
      class: 'ContextMethod',
      name: 'lookup',
      swiftReturns: 'ClassInfo?',
      swiftThrows: true,
      args: [
        {
          swiftType: 'Context',
          name: 'X',
        },
        {
          swiftType: 'String',
          name: 'id',
        },
      ],
      code: function(X, id) {
        // TODO: This should be:
        // if ( ! this.whitelist_[id] ) { ... }
        // Change it back once #777 is closed.
        if ( ! this.whitelist.includes(id) ) {
          throw new Error('Class "' + id + '" is not whitelisted.');
        }
        return this.__context__.lookup.call(X, id);
      },
      swiftCode: function() {/*
if whitelist_[id] as? Bool ?? false {
  throw FoamError("Class " + id + " is not whitelisted.")
}
return X.lookup(id)
      */}
    }
  ]
});
