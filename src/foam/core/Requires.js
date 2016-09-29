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
  package: 'foam.core',
  name: 'Requires',

  // documentation: 'Require Class Axiom',

  properties: [ 'name', 'path' ],

  methods: [
    function installInProto(proto) {
      var name = this.name;
      var path = this.path;

      // Create a private_ clone of the Class with the create() method decorated
      // to pass 'this' as the context if not explicitly provided.  This ensures
      // that the created object has access to this object's exported bindings.
      Object.defineProperty(proto, name, {
        get: function requiresGetter() {
          if ( ! this.hasOwnPrivate_(name) ) {
            var cls    = foam.lookup(path);
            var parent = this;

            this.assert(cls, 'Requires: Unknown class: ', path);

            var c = Object.create(cls);
            c.create = function requiresCreate(args, ctx) { return cls.create(args, ctx || parent); };
            this.setPrivate_(name, c);
          }

          return this.getPrivate_(name);
        },
        configurable: true,
        enumerable: false
      });
    }
  ]
});

foam.CLASS({
  refines: 'foam.core.Model',
  properties: [
    {
      class: 'AxiomArray',
      of: 'Requires',
      name: 'requires',
      adaptArrayElement: function(o) {
        if ( typeof o === 'string' ) {
          var a     = o.split(' as ');
          var path  = a[0];
          var parts = path.split('.');
          var name  = a[1] || parts[parts.length-1];
          return foam.core.Requires.create({name: name, path: path});
        }

        return foam.core.Requires.create(o);
      }
    }
  ]
});
