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
      name: 'whitelist_',
      expression: function(whitelist) {
        var w = {};
        for ( var i = 0 ; i < whitelist.length ; i++ ) {
          w[whitelist[i]] = true;
        }
        return w;
      },
      swiftType: 'Set<String>',
      swiftExpressionArgs: ['whitelist'],
      swiftExpression: function() {/*
var w = Set<String>()
for i in whitelist {
  w.insert(i)
}
return w
      */}
    }
  ],
  methods: [
    {
      class: 'ContextMethod',
      name: 'lookup',
      swiftType: 'ClassInfo?',
      swiftThrows: true,
      args: [
        {
          type: 'Context',
          name: 'X',
        },
        {
          type: 'String',
          name: 'id',
        },
      ],
      code: function(X, id) {
        if ( ! this.whitelist_[id] ) {
          throw new Error('Class "' + id + '" is not whitelisted.');
        }
        return this.__context__.lookup.call(X, id);
      },
      swiftCode: function() {/*
let id = id!
if whitelist.contains(id) {
  throw FoamError("Class " + id + " is not whitelisted.")
}
return X!.lookup(id)
      */}
    }
  ]
});
