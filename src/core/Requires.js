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

  properties: [
    // TODO: rename 'as' to name to get Axiom conflict detection
    { name: 'name', getter: function() { return 'requires_' + this.path; } },
    'path',
    'as'
  ],

  methods: [
    function installInProto(proto) {
      var path = this.path;
      var as   = this.as;

      Object.defineProperty(proto, as, {
        get: function requiresGetter() {
          if ( ! this.hasOwnPrivate_(as) ) {
            var cls    = foam.lookup(path);
            var parent = this;

            if ( ! cls )
              console.error('Unknown class: ' + path);

            var c = Object.create(cls);
            c.create = function requiresCreate(args, X) { return cls.create(args, X || parent); };
            this.setPrivate_(as, c);
          }

          return this.getPrivate_(as);
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
          var a = o.split(' as ');
          var m = a[0];
          var path = m.split('.');
          var as = a[1] || path[path.length-1];
          return foam.core.Requires.create({path: m, as: as});
        }

        return foam.core.Requires.create(o);
      }
    }
  ]
});
