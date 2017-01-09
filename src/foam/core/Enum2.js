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

// TODO: Make extend Model so can override methods (or do some other way).
foam.CLASS({
  package: 'foam.core.internal',
  name: 'EnumValueAxiom',

  documentation: 'The definition of a single Enum value.',

  properties: [
    {
      name: 'name',
      getter: function() { return this.definition.name; }
    },
    'definition'
  ],

  methods: [
    function installInClass(cls) {
      cls.installConstant(
          this.name,
          cls.create(this.definition, foam.__context__));
    }
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'EnumModel',
  extends: 'Model',

  properties: [
    [ 'extends', 'foam.core.AbstractEnum' ],
    {
      class: 'AxiomArray',
      of: 'foam.core.internal.EnumValueAxiom',
      name: 'values',
      preSet: function(_, v) {
        var used = {}; // map of ordinals used to check for duplicates

        var next = 0;
        for ( var i = 0 ; i < v.length ; i++ ) {
          var def = v[i].definition;
          def.name = foam.String.constantize(def.name);

          if ( ! def.hasOwnProperty('ordinal') ) {
            def.ordinal = next++;
          } else {
            next = def.ordinal + 1;
          }

          foam.assert(
            ! used[def.ordinal],
            this.id,
            'Enum error: duplicate ordinal found', def.name,
            used[def.ordinal], 'both have an ordinal of', def.ordinal);

          used[def.ordinal] = def.name;
        }

        return v;
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'AbstractEnum',

  documentation: 'Abstract base class for all Enum classes.',

  axioms: [ foam.pattern.Multiton.create({property: 'ordinal'}) ],

  properties: [
    {
      class: 'Int',
      name: 'ordinal',
      final: true
    },
    {
      class: 'String',
      name: 'name',
      final: true
    },
    {
      class: 'String',
      name: 'label',
      final: true
    },
    {
      name: 'VALUES',
      getter: function() { return this.cls_.values; }
    }
  ],

  methods: [
    function toString() { return this.name; }
  ]
});


// TODO(adamvy): Support default values.
foam.CLASS({
  package: 'foam.core',
  name: 'Enum2',
  extends: 'Property',

  documentation: 'A Property type for storing enum values.',

  properties: [
    { name: 'of', required: true },
    {
      name: 'adapt',
      code: foam.mmethod({
        AbstractEnum: function(o) { return o; },
        String:       function(o, n, prop) {
          return this.__context__.lookup(prop.of)[foam.String.constantize(n)];
        },
        Number:       function(o, n, prop) {
          return this.__context__.lookup(prop.of).create({ordinal: n});
        }
      })
    }
  ]
});


foam.LIB({
  name: 'foam',

  methods: [
    function ENUM2(m) {
      m.class = m.class || foam.core.Enum2;
      return foam.CLASS(m);
    }
  ]
});
