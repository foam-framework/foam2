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
      expression: function(name, property, returns, delegate) {
        if ( delegate ) {
          return returns ?
            function() {
              var self = this;
              var args = arguments;
              return this[property].then(function(d) {
                return d[name].apply(self, args);
              });
            } :
            function() {
              var self = this;
              var args = arguments;
              this[property].then(function(d) {
                d[name].apply(self, args);
              });
            };
        }
        return returns ?
          function() {
            var self = this;
            var args = arguments;
            return this[property].then(function(d) {
              return d[name].apply(d, args);
            });
          } :
          function() {
            var self = this;
            var args = arguments;
            this[property].then(function(d) {
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
      name: 'postSet',
      expression: function(name) {
        var stateName    = name + 'State';
        var delegateName = name + 'Delegate';
        return function(_, p) {
          var self = this;
          this[stateName]    = undefined;
          this[delegateName] = undefined;

          p.then(function(d) { self[delegateName] = d; });
        };
      }
    }
  ],

  methods: [
    function installInClass(cls) {
      this.SUPER(cls);

      var myName         = this.name;
      var stateName      = this.name + 'State';
      var delegateName   = this.name + 'Delegate';
      var pendingState   = 'Pending' + foam.String.capitalize(myName);
      var fulfilledState = 'Fulfilled' + foam.String.capitalize(myName);

      var delegate = foam.lookup(this.of);

      var methods = this.methods ?
          this.methods.map(function(f) {
            var m = delegate.getAxiomByName(f);
            foam.assert(foam.core.Method.isInstance(m), 'Cannot proxy non-method', f);
            return m;
          }) :
          delegate.getOwnAxiomsByClass(foam.core.Method);

      var methodNames = methods.map(function(m) { return m.name; });

      var myAxioms = [
        foam.core.Proxy.create({
          name:      stateName,
          of:        this.of,
          delegates: methodNames,
          forwards:  [],
          factory: function() {
            return this[pendingState].create();
          }
        }),
        foam.core.Property.create({
          name: delegateName,
          postSet: function() {
            this[stateName] = this[fulfilledState].create();
          }
        })
      ];

      var pendingMethods = [];

      for ( var i = 0 ; i < methods.length ; i++ ) {
        pendingMethods.push(foam.core.PromisedMethod.create({
          name: methods[i].name,
          property: myName,
          returns:  methods[i].returns,
          delegate: false
        }));
      }

      var name = this.name;
      myAxioms = myAxioms.concat(
        foam.core.InnerClass.create({
          model: {
            name: pendingState,
            axioms: [
              foam.pattern.Singleton.create()
            ],
            methods: pendingMethods
          }
        }),
        foam.core.InnerClass.create({
          model: {
            name: fulfilledState,
            properties: [
              {
                class:    'Proxy',
                name:     delegateName,
                of:       this.of,
                topics:   this.topics,
                forwards: methodNames
              }
            ],
            axioms: [
              foam.pattern.Singleton.create()
            ]
          }
        }));

      cls.installAxioms(myAxioms);
    }
  ]
});
