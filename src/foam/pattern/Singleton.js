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
  package: 'foam.pattern',
  name: 'Singleton',

  documentation: `
  A Singleton Axiom, when added to a Class, makes it implement
  the Singleton Pattern, meaning that all calls to create()
  will return the same (single) instance.
  `,

  properties: [
    [ 'name', 'create' ]
  ],

  methods: [
    function installInClass(cls) {
      /** @param {any} cls */
      var oldCreate = cls.create;
      var newCreate = cls.create = function() {
        // This happens when a newer Axiom replaces create().
        // If this happens, don't apply Singleton behaviour.
        if ( this.create !== newCreate )
          return oldCreate.apply(this, arguments);

        return this.private_.instance_ ||
          ( this.private_.instance_ = oldCreate.apply(this, arguments) );
      };
    },

    function installInProto(p) {
      // Not needed, but improves performance.
      p.clone  = function() { return this; };
      p.equals = function(o) { /** @param {any=} o */ return this === o; };
    }
  ]
});

// We only need one Singleton, so make it a Singleton.
foam.CLASS({
  package: 'foam.pattern',
  name: 'SingletonSingletonRefinement',
  refines: 'foam.pattern.Singleton',
  axioms: [ foam.pattern.Singleton.create() ]
});
