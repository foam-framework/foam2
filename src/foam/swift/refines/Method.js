/**
 * @license
 * Copyright 2017 Google Inc. All Rights Reserved.
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
  refines: 'foam.core.Method',
  requires: [
    'foam.swift.Argument as SwiftArgument',
    'foam.core.Argument',
    'foam.swift.Method',
  ],
  properties: [
    {
      class: 'String',
      name: 'swiftName',
      expression: function(name) { return name; },
    },
    {
      class: 'FObjectArray',
      of: 'foam.core.Argument',
      name: 'args',
      adaptArrayElement: function(o, prop) {
        var Argument = foam.lookup('foam.core.Argument');
        return typeof o === 'string' ? Argument.create({name: o}) :
            Argument.create(o);
      },
    },
    {
      name: 'swiftArgs',
      expression: function(args) {
        var swiftArgs = [];
        args.forEach(function(a) {
          swiftArgs.push(this.Argument.create(a).toSwiftArg());
        }.bind(this));
        return swiftArgs;
      },
      adapt: function(_, n) {
        var self = this;
        var adaptElement = function(o) {
          if ( o.class ) {
            var m = foam.lookup(o.class);
            if ( ! m ) throw 'Unknown class : ' + o.class;
            return m.create(o, self);
          }
          return self.SwiftArgument.isInstance(o) ? o : self.SwiftArgument.create(o);
        }
        return n.map(adaptElement);
      },
    },
    {
      class: 'String',
      name: 'swiftVisibility',
      value: 'public',
    },
    {
      class: 'String',
      name: 'swiftCode',
    },
    {
      class: 'String',
      name: 'swiftReturnType',
    },
    {
      class: 'StringArray',
      name: 'swiftAnnotations',
    }
  ],
  methods: [
    function createChildMethod_(child) {
      var m = child.clone();

      for ( var key in this.instance_ ) {
        if ( !m.hasOwnProperty(key) ) {
          m[key] = this.instance_[key]
        }
      }

      return m;
    },
    function writeToSwiftClass(cls, superAxiom) {
      if ( !this.swiftCode ) return;
      cls.method(this.Method.create({
        name: this.swiftName,
        body: this.swiftCode,
        returnType: this.swiftReturnType,
        args: this.swiftArgs,
        visibility: this.swiftVisibility,
        override: !!(superAxiom && superAxiom.swiftCode),
        annotations: this.swiftAnnotations,
      }));
    },
  ]
});
