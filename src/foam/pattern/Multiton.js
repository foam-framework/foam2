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
  A Multiton Axiom, when added to a Class, makes it implement
  the Multiton Pattern, meaning that calls to create() with
  the same value for the specified 'property', will return the
  same instance.

  Ex.:
  foam.CLASS({
    name: 'Color',
    axioms: [ foam.pattern.Multiton.create({property: 'color'}) ],
    properties: [ 'color' ],
    methods: [ function init() { log('Creating Color:', this.color); } ]
  });

  var red1 = Color.create({color: 'red'});
  var red2 = Color.create({color: 'red'});
  var blue = Color.create({color: 'blue'});

  log(red1 === red2); // true, same object
  log(red1 === blue); // false, different objects
*/
foam.CLASS({
  package: 'foam.pattern',
  name: 'Multiton',

  properties: [
    [ 'name', 'create' ],
    {
      // FUTURE: switch to 'properties' to support multiple keys when/if needed.
      class: 'String',
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

        // If key isn't provided, try using property.value instead
        if ( key === undefined ) {
          key = cls.getAxiomByName(property).value;
        }

        return instances[key] ||
          ( instances[key] = oldCreate.apply(this, arguments) );
      };
    },

    function installInProto(p) {
      // Not needed, but improves performance.
      p.clone  = function() { return this; };
      p.equals = function(o) { return this === o; };
    }
  ]
});
