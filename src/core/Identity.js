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
  An Identity Axiom which installs a psedo-property to use as an id.
  Use when you want a multi-part primary-key.
<pre>
  Ex.
  foam.CLASS({
    name: 'Person',
    ids: [ 'firstName', 'lastName' ],
    properties: [ 'firstName', 'lastName', 'age', 'sex' ]
  });

  > var p = Person.create({firstName: 'Kevin', lastName: 'Greer'});
  > p.id;
  ["Kevin", "Greer"]
</pre>
*/
// TODO: rename
// TODO: check that 'id' doesn't already exist
foam.CLASS({
  package: 'foam.core',
  name: 'Identity',

  properties: [ 'ids' ],

  methods: [
    function installInClass(cls) {
      var ids = this.ids.map(function(id) {
        var prop = cls.getAxiomByName(id);
        // TODO: assert prop is Property
        if ( ! prop ) {
          console.error('Unknown ids property:', cls.id + '.' + id);
        }
        return prop;
      });

      console.assert(ids.length, 'Ids must contain at least one id.');

      if ( ids.length == 1 ) {
        console.assert(ids[0].name !== 'id', "Redundant to set ids: to just 'id'.");
        cls.ID = ids[0];
      } else {
        cls.ID = {
          name: 'ID',
          get: function(o) {
            var a = new Array(ids.length);
            for ( var i = 0 ; i < ids.length ; i++ ) a[i] = ids[i].get(o);
            return a;
          },
          set: function(o, a) {
            for ( var i = 0 ; i < ids.length ; i++ ) ids[i].set(o, a[i]);
          },
          compare: function(o1, o2) {
            for ( var i = 0 ; i < ids.length ; i++ ) {
              var c = ids[i].compare(o1, o2);
              if ( c ) return c;
            }
            return 0;
          }
        };
      }
    },

    function installInProto(proto) {
      var ID = proto.cls_.ID;
      // FUTURE: install a real property with propertyChange support
      Object.defineProperty(proto, 'id', {
        get: function() { return ID.get(this); },
        set: function(id) { ID.set(this, id); }
      });
    }
  ]
});
