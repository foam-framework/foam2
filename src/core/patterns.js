/*
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

foam.CLASS({
  package: 'foam.pattern',
  name: 'Singleton',

  methods: [
    function installInClass(cls) {
      var instance;
      var oldCreate = cls.create;
      cls.create = function() {
        return instance || ( instance = oldCreate.apply(this, arguments) );
      }
    },
    function clone() { return this; },
    function equals(other) { return other === this; }
  ]
});

// We only need one Singleton, so make it a Singleton.
foam.CLASS({
  refines: 'foam.pattern.Singleton',
  axioms: [ foam.pattern.Singleton.create() ]
});

foam.CLASS({
  package: 'foam.pattern',
  name: 'With',
  axioms: [ foam.pattern.Singleton.create() ],
  methods: [
    {
      name: 'with',
      code: function(f, opt_source) {
        opt_source = opt_source || this;
        var argNames = foam.fn.argsArray(f);
        var args = [];
        for ( var i = 0 ; i < argNames.length ; i++ ) {
          var a = opt_source[argNames[i]];
          if ( typeof a === "function" ) a = a.bind(opt_source);
          args.push(a);
        }
        return f.apply(this, args);
      }
    }
  ]
});
