/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
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

/*
  A -> foo(C)
       foo(D)
  B -> foo(C)

  How does B.foo(D) work?
  Copy methods? Then what if A gets refined?
  Lookup B.foo, otherwise lookup A.foo()?
    Then what about FObject vs. particular class lookup?
  What about treating 'this' as first argument?
*/

foam.CLASS({
  package: 'foam.core',
  name: 'MultiMethod',
  extends: 'foam.core.AbstractMethod',

  properties: [
    {
      name: 'name',
      factory: function() {
        return this.methodName +
          this.args.map(function(a) { return a.type; }).join(':');
      }
    },
    {
      name: 'methodName',
      required: true
    }
  ],

  methods: [
    function installInProto(proto) {
      var key = this.cls_.id.replace(/\./g,':') + ':' + this.methodName;
      console.log('Installing: ' + key);
      var dispath = this.createDispatch(proto, key, 0, this.args);
      displatch.code = this.code;
    },

    function createDispatch(proto, prefix, pos, args) {
      var d = proto[prefix];

      if ( ! d ) {
        var prefix2 = prefix + ':' + args[pos] + typeName;
        proto[prefix] = function dispatch() {
          if ( arguments.length === pos ) {
            return arguments.callee.code.apply(this, arguments);
          }
          var t = foam.typeOf(arguments[pos]);
          var f = t[prefix2];
          return f.apply(this, arguments);
        };
      }

      if ( pos === args.length ) return proto[prefix];
    },

    function exportAs(obj) {
      var m = obj[this.name];
      /** Bind the method to 'this' when exported so that it still works. **/
      return function exportedMethod() { return m.apply(obj, arguments); };
    }
  ]
});
