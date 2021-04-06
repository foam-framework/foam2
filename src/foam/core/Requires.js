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

/**
  The Requires Axiom is used to declare that a class requires/creates objects
  of a particular class. Required classes can be accessed without fully
  qualifying their package names. Required classes are automatically
  created in the sub-context of the creating object.
<pre>
  Ex.
  foam.CLASS({
    package: 'demo.bank',
    name: 'AccountTester',
    requires: [
      // Require demo.bank.Account so that it can be accessed as this.Account
      'demo.bank.Account',

      // Require SavingsAccount and alias it so that it can be accessed
      // as this.SAccount
      'demo.bank.SavingsAccount as SAccount'
    ],
    methods: [ function init() {
      var a = this.Account.create();
      var s = this.SAccount.create();
    } ]
  });
</pre>
*/
foam.CLASS({
  package: 'foam.core',
  name: 'Requires',

  properties: [
    {
      name: 'name',
      factory: function() {
        return this.path.split('.').pop();
      },
    },
    // Lower priority so it is set after Properties, so that it can override
    // Property constants if there is a conflict.
    [ 'priority', 90 ],
     'path',
    'flags'
  ],

  methods: [
    function installInProto(proto) {
      var name = this.name;
      var path = this.path;
      var setCls;

      // Create a private_ clone of the Class with the create() method decorated
      // to pass 'this' as the context if not explicitly provided.  This ensures
      // that the created object has access to this object's exported bindings.
      Object.defineProperty(proto, name, {
        get: function requiresGetter() {
          if ( ! this.hasOwnPrivate_(name) ) {
            var cls    = setCls || (this.__context__ || foam).lookup(path);
            var parent = this;
            foam.assert(cls, 'Requires: Unknown class: ', path);

            var c = Object.create(cls);
            c.create = function requiresCreate(args, ctx) { return cls.create(args, ctx || parent); };
            this.setPrivate_(name, c);
          }

          return this.getPrivate_(name);
        },
        set: function(cls) {
          this.clearPrivate_(name);
          setCls = cls;
        },
        configurable: true,
        enumerable: false
      });
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.Model',
  package: 'foam.core',
  name: 'ModelRequiresRefines',
  properties: [
    {
      class: 'AxiomArray',
      of: 'Requires',
      name: 'requires',
      adaptArrayElement: function(o) {
        if ( typeof o === 'string' ) {
          var a    = o.split(' as ');
          var path = a[0];
          var r = foam.core.Requires.create({path: path}, this);
          if ( a[1] ) r.name = a[1];
          return r;
        }
        return foam.core.Requires.create(o, this);
      }
    }
  ]
});
