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

/**
  A Singleton Axiom, when added to a Class, makes it implement
  the Singleton Pattern, meaning that all calls to create()
  will return the same (single) instance.
*/
foam.CLASS({
  package: 'foam.pattern',
  name: 'Singleton',

  methods: [
    function installInClass(cls) {
      var oldCreate = cls.create;
      cls.create = function() {
        return this.private_.instance_ ||
            ( this.private_.instance_ = oldCreate.apply(this, arguments) );
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


/**
  A Multiton Axiom, when added to a Class, makes it implement
  the Multiton Pattern, meaning that calls to create() with
  the same value for the specified 'property', will return the
  same instance.
*/
foam.CLASS({
  package: 'foam.pattern',
  name: 'Multiton',

  properties: [
    {
      // FUTURE: switch to 'properties' to support multiple keys when/if needed.
      name: 'property'
    }
  ],

  methods: [
    function installInClass(cls) {
      var property  = this.property;
      var oldCreate = cls.create;
      cls.create = function(args) {
        var instances = this.private_.instances ||
            ( this.private_.instances = {} );
        var key = args[property];
        return instances[key] || ( instances[key] = oldCreate.apply(this, arguments) );
      }
    },
    function clone() { return this; },
    function equals(other) { return other === this; }
  ]
});
