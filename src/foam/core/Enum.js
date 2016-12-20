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
 *       of: 'Status',
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
 * </pre>
 */
foam.CLASS({
  package: 'foam.core.internal',
  name: 'EnumValue',

  documentation: 'A single value of an Enum.',

  properties: [
    {
      class: 'String',
      name: 'name',
      preSet: function(_, s) {
        return foam.String.constantize(s);
      }
    },
    {
      class: 'String',
      name: 'label'
    },
    {
      class: 'Int',
      name: 'ordinal'
    },
    {
      name: 'values'
    }
  ],

  methods: [
    function installInClass(cls) {
      var name    = this.name;
      var ordinal = this.ordinal;

      Object.defineProperty(
        cls,
        name,
        {
          configurable: true,
          get: function() {
            return cls.create({ ordinal: ordinal }, foam.__context__);
          }
        });
    },

    function installInProto(proto) {
      this.installInClass(proto);
    },

    function initArgs(args, ctx) {
      this.values = args;
      this.SUPER(args, ctx);
    }
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'EnumModel',

  documentation: 'A complete Enum specification.',

  properties: [
    {
      name: 'axioms_',
      transient: true,
      factory: function() {
        return [
          foam.core.Int.create({
            name: 'ordinal',
            final: true
          }),
          foam.core.String.create({
            name: 'name',
            final: true
          }),
          foam.core.String.create({
            name: 'label',
            final: true
          }),
          foam.core.Method.create({
            name: 'toString',
            code: function() {
              return this.name;
            }
          }),
          {
            name: 'enum_create',
            installInClass: function(cls) {
              var instances = {};
              var oldCreate = cls.create;

              cls.create = function(args, ctx) {
                var key = args.ordinal || 0; // use default if not specified

                // Short-circuit if we already create the instance for
                // this ordinal.
                if ( instances[key] ) return instances[key];

                var enumValue = cls.model_.values.find(function(o) {
                  return o.ordinal === key;
                });

                foam.assert(enumValue, 'No enum value found with ordinal', key);
                var newArgs = enumValue.values;
                newArgs.ordinal = key;
                newArgs.name = enumValue.name;

                return instances[key] = oldCreate.call(this, newArgs, ctx);
              };
            }
          }
        ];
      }
    },
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'String',
      name: 'package'
    },
    {
      class: 'String',
      name: 'id',
      expression: function(name, package) {
        return package ? package + '.' + name : name;
      }
    },
    {
      class: 'AxiomArray',
      of: 'foam.core.Property',
      name: 'properties',
      adaptArrayElement: function(o) {
        if ( typeof o === 'string' ) {
          var p = foam.core.Property.create();
          p.name = o;
          return p;
        }

        if ( Array.isArray(o) ) {
          var p = foam.core.Property.create();
          p.name  = o[0];
          p.value = o[1];
          return p;
        }

        if ( o.class ) {
          var m = foam.lookup(o.class);
          if ( ! m ) throw 'Unknown class : ' + o.class;
          return m.create(o);
        }

        return foam.core.Property.create(o);
      }
    },
    {
      class: 'AxiomArray',
      of: 'foam.core.Method',
      name: 'methods',
      adaptArrayElement: function(o) {
        if ( typeof o === 'function' ) {
          foam.assert(o.name, 'Method must be named');
          var m = foam.core.Method.create();
          m.name = o.name;
          m.code = o;
          return m;
        }
        return foam.core.Method.create(o);
      }
    },
    {
      class: 'AxiomArray',
      of: 'foam.core.Constant',
      name: 'constants'
    },
    {
      class: 'AxiomArray',
      of: 'foam.core.Listener',
      name: 'listeners'
    },
    {
      class: 'AxiomArray',
      of: 'foam.core.Action',
      name: 'actions'
    },
    {
      class: 'AxiomArray',
      of: 'foam.core.internal.EnumValue',
      name: 'values',
      preSet: function(_, v) {
        var used = {};

        var next = 0;
        for ( var i = 0 ; i < v.length ; i++ ) {
          if ( ! v[i].hasOwnProperty('ordinal') ) v[i].ordinal = next++;
          else next = v[i].ordinal + 1;
          foam.assert(
            ! used[v[i].ordinal],
            this.id,
            'Enum error: duplicate ordinal found', v[i].name,
            used[v[i].ordinal], 'both have an ordinal of', v[i].ordinal);

          used[v[i].ordinal] = v[i].name;
        }

        return v;
      }
    }
  ],

  methods: [
    function buildClass() {
      var parent = foam.core.FObject, cls;

      cls                  = Object.create(parent);
      cls.prototype        = Object.create(parent.prototype);
      cls.prototype.cls_   = cls;
      cls.prototype.model_ = this;
      cls.private_         = { axiomCache: {} };
      cls.axiomMap_        = Object.create(parent.axiomMap_);
      cls.id               = this.id;
      cls.package          = this.package;
      cls.name             = this.name;
      cls.model_           = this;

      cls.installModel(this);

      var values, model = this;

      cls.getValues = function() {
        if ( ! values ) {
          values = model.values.map(function(m) {
            return cls[m.name];
          });
        }
        return values;
      }

      return cls;
    }
  ]
});


// TODO(adamvy): Support default values.
foam.CLASS({
  package: 'foam.core',
  name: 'Enum',
  extends: 'Property',

  documentation: 'A Property type for storing enum values.',

  properties: [
    { name: 'of', required: true },
    [
      'adapt',
      function(o, n, prop) {
        // FUTURE: make into a mmethod()

        if ( foam.core.internal.EnumValue.isInstance(n) ) return n;

        var type = foam.typeOf(n);
        var e    = this.__context__.lookup(prop.of);

        if ( type === foam.String ) {
          return e[foam.String.constantize(n)];
        }

        if ( type === foam.Number ) {
          return e.create({ordinal: n}, foam.__context__);
        }
      }
    ]
  ]
});


foam.LIB({
  name: 'foam',

  methods: [
    function ENUM(m) {
      var model = foam.core.EnumModel.create(m);
      model.validate();

      var cls = model.buildClass();
      cls.validate();

      foam.register(cls);
      foam.package.registerClass(cls);

      return cls;
    }
  ]
});


/*
TODO(adamvy):
  - Only serialize the ordinal.
  - Freeze the instances.
*/
