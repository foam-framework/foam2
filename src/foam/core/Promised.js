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

foam.CLASS({
  package: 'foam.core',
  name: 'PromisedMethod',
  extends: 'ProxiedMethod',

  properties: [
    {
      name: 'code',
      expression: function(name, property, type) {
        return type ?
          function() {
            var args = arguments;
            return this.delegate[property].then(function(d) {
              return d[name].apply(d, args);
            });
          } :
          function() {
            var args = arguments;
            this.delegate[property].then(function(d) {
              d[name].apply(d, args);
            });
          };
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'Promised',
  extends: 'Property',
  requires: [
    'foam.core.PromisedMethod'
  ],
  properties: [
    {
      name: 'of',
      required: true
    },
    {
      class: 'StringArray',
      name: 'methods',
      value: null,
      factory: null
    },
    {
      class: 'StringArray',
      name: 'topics',
      value: null,
      factory: null
    },
    {
      class: 'String',
      name: 'stateName',
      expression: function(name) { return name + 'State'; }
    },
    {
      name: 'postSet',
      expression: function(stateName) {
        return function(_, p) {
          var self = this;
          this[stateName] = undefined;
          p.then(function(d) { self[stateName] = d; });
        };
      }
    }
  ],

  methods: [
    function installInClass(cls) {
      this.SUPER(cls);

      var myName         = this.name;
      var stateName      = this.stateName;
      var pendingState   = 'Pending' + foam.String.capitalize(myName);

      var delegate = this.__context__.lookup(this.of);

      function resolveName(name) {
        var m = delegate.getAxiomByName(name);
        foam.assert(foam.core.Method.isInstance(m), 'Cannot proxy non-method', name);
        return m;
      }

      var methods = this.methods ?
          this.methods.map(resolveName) :
          delegate.getOwnAxiomsByClass(foam.core.Method);

      var methodNames = methods.map(function(m) { return m.name; });

      var myAxioms = [
        foam.core.Proxy.create({
          name: stateName,
          of: this.of,
          forwards: methodNames,
          factory: function() {
            return this[pendingState].create({ delegate: this });
          },
          swiftFactory: `
            return ${pendingState}_create(["delegate": self])
          `,
          javaFactory: `
            return new ${pendingState}.Builder(getX()).setDelegate(this).build();
          `,
          transient: true
        }),
        foam.core.ProxySub.create({
          topics: this.topics,
          prop:   stateName
        })
      ];

      var pendingMethods = [];

      // Use all methods from here on in to satisfy the interface.
      // Methods that aren't part of this.methods should never get called
      // but they need to be added to make compilers happy.
      methods = delegate.getOwnAxiomsByClass(foam.core.Method);
      for ( var i = 0 ; i < methods.length ; i++ ) {
        pendingMethods.push(foam.core.PromisedMethod.create({
          name: methods[i].name,
          property: myName,
          delegate: false
        }));
      }

      myAxioms = myAxioms.concat(
        foam.core.InnerClass.create({
          model: {
            name: pendingState,
            implements: [this.of],
            methods: pendingMethods,
            properties: [
              {	
                class: 'FObjectProperty',
                of: cls.id,	
                name: 'delegate'	
              }
            ]
          }
        })
      );

      cls.installAxioms(myAxioms);
    }
  ]
});
