/**
 * @license
 * Copyright 2017 Google Inc. All Rights Reserved.
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
 * For those familiar with Java, FOAM Enums are very similar to Java enums in
 * design.
 *
 * An Enum is essentially a class with a fixed number of named instances.
 * The instances are frequently referred to as Enum Values, or the 'values'
 * of an Enum.
 *
 * Enums have most of the features available to FOAM classes, including
 * properties, methods, constants, templates, and listeners.
 *
 * Enums extend from FObject, so they inherit FObject features such as
 * pub/sub events, diffing, hashCode, etc.
 *
 * Enums also have a few built-in properties by default. Every Enum has an
 * 'ordinal' property, which is a integer unique to all the Enum Values of a
 * particular Enum. Each enum also has a 'name' property, which is the name
 * given to each Enum Value.
 *
 * Example usage:
 * <pre>
 * // To define an enum we use the foam.ENUM() function.
 * foam.ENUM({
 *   name: 'IssueStatus',
 *
 *   // Enums share many features with regular classes, the properties
 *   // and methods we want our enums to have are defined as follows.
 *   properties: [
 *     {
 *       class: 'Boolean',
 *       name: 'consideredOpen',
 *       value: true
 *     }
 *   ],
 *
 *   methods: [
 *     function foo() {
 *       return this.label + ( this.consideredOpen ? ' is' : ' is not' ) +
 *           ' considered open.';
 *     }
 *   ],
 *
 *   // Use the values: key to define the actual Enum Values that we
 *   // want to exist.
 *   values: [
 *     {
 *       name: 'OPEN'
 *     },
 *     {
 *       // The ordinal can be specified explicitly.
 *       name: 'CLOSED',
 *       ordinal: 100
 *     },
 *     {
 *       // If the ordinal isn't given explicitly it is auto assigned as
 *       // the previous ordinal + 1
 *       name: 'ASSIGNED'
 *     },
 *     {
 *       // You can specify the label, which will be used when rendering in a
 *       // combo box or similar
 *       name: 'UNVERIFIED',
 *       label: 'Unverified'
 *     },
 *     {
 *       // Values for additional properties to your enum are also defined
 *       // inline.
 *       name: 'FIXED',
 *       label: 'Fixed',
 *       consideredOpen: false
 *     }
 *   ]
 * });
 *
 * console.log(IssueStatus.OPEN.name); // outputs "OPEN"
 * console.log(IssueStatus.ASSIGNED.consideredOpen); // outputs "true"
 *
 * // Enum value ordinals can be specified.
 * console.log(IssueStatus.CLOSED.ordinal); // outputs 100
 * // values without specified ordinals get auto assigned.
 * console.log(IssueStatus.ASSIGNED.ordinal); // outputs 101
 *
 * // Methods can be called on the enum values.
 * // outputs "Fixed is not considered open."
 * console.log(IssueStatus.FIXED.foo());
 *
 * // To store enums on a class, it is recommended to use the Enum property
 * // type.
 * foam.CLASS({
 *   name: 'Issue',
 *   properties: [
 *     {
 *       class: 'Enum',
 *       of: 'IssueStatus',
 *       name: 'status'
 *     }
 *   ]
 * });
 *
 * var issue = Issue.create({ status: IssueStatus.UNVERIFIED });
 * console.log(issue.status.label); // outputs "Unverified"
 *
 * // Enum properties give you some convenient adapting.
 * // You can set the property to the ordinal or the
 * // name of an enum, and it will set the property
 * // to the correct Enum value.
 *
 * issue.status = 100;
 *
 * issue.status === IssueStatus.CLOSED; // is true
 *
 * // Enum properties also allow you to assign them via the name
 * // of the enum.
 *
 * issue.status = "ASSIGNED"
 *
 * issue.status === IssueStatus.ASSIGNED; // is true
 *
 * The extent of all Enum values can be accessed from either the collection or from any
 * individual Enum value:
 * console.log(IssueStatus.VALUES, IssueStatus.CLOSED.VALUES);
 *
 * Values can be specified as just Strings if you don't want to explicitly set the label
 * or ordinal. Ex.:
 *
 * foam.ENUM({
 *  name: 'DaysOfWeek',
 *  values: [
 *    'SUNDAY',
 *    'MONDAY',
 *    'TUESDAY',
 *    'WEDNESDAY',
 *    'THURSDAY',
 *    'FRIDAY',
 *    'SATURDAY'
 *  ]
 * });
 *
 * </pre>
 */
// TODO: Make extend Model so can override methods (or do some other way).
foam.CLASS({
  package: 'foam.core.internal',
  name: 'EnumValueAxiom',

  documentation: 'The definition of a single Enum value.',

  properties: [
    {
      name: 'ordinal',
      getter: function() { return this.definition.ordinal; },
      setter: function(o) { this.definition.ordinal = o; }
    },
    {
      name: 'name',
      getter: function() { return this.definition.name; }
    },
    'definition'
  ],

  methods: [
    function installInClass(cls) {
      var e = cls.create(this.definition);
      cls.installConstant(this.name, e);
      cls.VALUES.push(e);
    }
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'EnumModel',
  extends: 'Model',

  requires: [
    'foam.core.internal.EnumValueAxiom',
  ],

  documentation: 'Model for defining Enum(erations).',

  properties: [
    [ 'extends', 'foam.core.AbstractEnum' ],
    {
      class: 'AxiomArray',
      of: 'foam.core.internal.EnumValueAxiom',
      name: 'values',
      adapt: function(_, v) {
        var used = {}; // map of ordinals used to check for duplicates

        var next = 0;
        for ( var i = 0 ; i < v.length ; i++ ) {
          var def = v[i];

          if ( foam.String.isInstance(def) ) {
            def = { label: def, name: foam.String.constantize(def) };
          }

          def = this.EnumValueAxiom.isInstance(def) ? def :
            def.class ? this.lookup(def.class).create(def) :
            this.EnumValueAxiom.create({definition: def});

          v[i] = def;

          if ( def.ordinal || def.ordinal === 0 ) {
            next = def.ordinal + 1;
          } else {
            def.ordinal = next++;
          }

          if ( used[def.ordinal] ) {
            throw this.id +
                ' Enum error: duplicate ordinal found ' + def.name + ' ' +
                used[def.ordinal] + ' both have an ordinal of ' + def.ordinal;
          }

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

  axioms: [
    foam.pattern.Multiton.create({property: 'ordinal'}),
    {
      installInClass: function(cls) {
        // Each sub-class of AbstractEnum gets it's own VALUES array.
        Object.defineProperty(cls, 'VALUES', {
          get: function() {
            return this.private_.VALUES || ( this.private_.VALUES = [] );
          },
          configurable: true,
          enumerable: false
        });
      },
      installInProto: function(p) {
        Object.defineProperty(p, 'VALUES', {
          get: function() { return this.cls_.VALUES; },
          configurable: true,
          enumerable: false
        });
      }
    }
  ],

  properties: [
    {
      class: 'String',
      name: 'documentation',
      transient: true,
    },
    {
      class: 'Int',
      name: 'ordinal',
      // NOTE: Default value of -1 forces legitimate values (starting at 0) to
      // all be non-default. This is important for, e.g., serialization of enum
      // values:
      // https://github.com/foam-framework/foam2/issues/637
      value: -1,
      final: true
    },
    {
      class: 'String',
      name: 'name',
      transient: true,
      final: true
    },
    {
      class: 'String',
      name: 'label',
      final: true,
      transient: true,
      factory: function() {
        return this.name;
      }
    }
  ],

  methods: [
    function outputFObject(o) {
      o.out(this.ordinal);
    },
    function toString() { return this.name; }
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'Enum',
  extends: 'Property',

  documentation: 'A Property type for storing enum values.',

  properties: [
    {
      class: 'Class',
      name: 'of',
      required: true
    },
    {
      name: 'value',
      adapt: function(_, n) {
        if ( foam.String.isInstance(n) ) n = this.of[n];
        if ( foam.Object.isInstance(n) && n.class )
          n = foam.lookup(n.class).create(n);
        return n
      },
      expression: function(of) {
        return of && of.VALUES[0];
      },
    },
    {
      name: 'javaValue',
      expression: function(of, value) {
        return of.id + '.' + value;
      },
    },
    [
      'adapt',
      function(o, n, prop) {
        var of = prop.of;

        if ( n && n.cls_ === of ) return n;

        var type = foam.typeOf(n), ret;

        if ( type === foam.String ) {
          ret = of[foam.String.constantize(n)];
        } else if ( type === foam.Number ) {
          ret = of.create({ordinal: n}, foam.__context__);
        } else if ( type === foam.Object ) {
          ret = of.create(n, foam.__context__);
        }

        if ( ret ) return ret;

        throw 'Attempt to set invalid Enum value. Enum: ' + of.id + ', value: ' + n;
      }
    ],
    {
      name: 'toJSON',
      value: function(value) { return value.ordinal; }
    }
  ]
});


foam.LIB({
  name: 'foam',

  methods: [
    function ENUM(m) {
      m.class = m.class || 'foam.core.EnumModel';
      return foam.CLASS(m);
    }
  ]
});
