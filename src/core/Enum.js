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

/*
TODO(adamvy):
- Only serialize the ordinal?
- Freeze the instances?
*/

/**
 * For those familiar with Java, FOAM Enums are very similar to Java enums in design.
 *
 * An Enum is essentially a class with a fixed number of named instances.  The instances
 * are frequently referred to as Enum Values, or the 'values' of an Enum.
 *
 * Enums have most of the features available to FOAM classes, including properties, methods,
 * constants, templates, and listeners.
 *
 * Enums extend from FObject, so they inherit FObject features such as pub/sub events,
 * diffing, hashCode, etc.
 *
 * Enums also have a few built-in properties by default.  Every Enum has an 'ordinal'
 * property, which is a integer unique to all the Enum Values of a a particular Enum.  Each
 * enum also has a 'name' property, which is the name given to each Enum Value.
 *
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
 *       name: 'label'
 *     }
 *   ],
 *   methods: [
 *     function foo() {
 *       return 'Label is ' + this.label;
 *     }
 *   ],
 *
 *   // Use the values: key to define the actual Enum Values that we want to exist.
 *   values: [
 *     {
 *       name: 'OPEN',
 *       // Use an inner values: map to define the values we want to assign
 *       // to the properties of the enum for this specific Enum Value.
 *       values: {
 *         label: 'Open'
 *       }
 *     },
 *     {
 *       name: 'CLOSED',
 *       // The ordinal can be specified explicitly.
 *       ordinal: 100,
 *       values: {
 *         label: 'Closed'
 *       }
 *     },
 *     {
 *       // If the ordinal isn't given explicitly it is auto assigned as the previous
 *       // ordinal + 1
 *       name: 'ASSIGNED',
 *       values: {
 *         label: 'Assigned'
 *       }
 *     }
 *   ]
 * });
 *
 * console.log(IssueStatus.OPEN.label); // outputs "Open"
 * console.log(IssueStatus.ASSIGNED.foo()); // outputs "Label is Assigned"
 *
 * // Enum value ordinals can be specified.
 * console.log(IssueStatus.CLOSED.ordinal); // outputs 100
 * // values without specified ordinals get auto assigned.
 * console.log(IssueStatus.ASSIGNED.ordinal); // outputs 101
 *
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
 * var issue = Issue.create({ status: IssueStatus.OPEN });
 * console.log(issue.status.label); // outputs "Open"
 *
 * // Enum properties give you some convenient adapting.
 * // You can set the property to the ordinal or the
 * // name of an enum, and it will set the property
 * // to the correct Enum value.
 *
 * issue.status = 100;
 *
 * issue.status === IssueStatus.OPEN; // is true
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

  properties: [
    {
      class: 'String',
      name: 'name',
      preSet: function(_, s) {
        return foam.String.constantize(s);
      }
    },
    {
      class: 'Int',
      name: 'ordinal'
    },
    {
      name: 'values',
      factory: function() { return {}; }
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
            return cls.create({ ordinal: ordinal });
          }
        });
    },
    function installInProto(proto) {
      this.installInClass(proto);
    }
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'EnumModel',

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
          {
            name: 'enum_create',
            installInClass: function(cls) {
              var instances = {};
              var oldCreate = cls.create;

              cls.create = function(args, ctx) {
                var key = args.ordinal || 0; // use default if not specified

                // Short-circuit if we already create the instance for this ordinal.
                if ( instances[key] ) return instances[key];

                var enumValue = cls.model_.values.find(function(o) {
                  return o.ordinal === key;
                });

                foam.__context__.assert(enumValue, 'No enum value found with ordinal', key);
                var args = enumValue.values;
                args.ordinal = key;
                args.name = enumValue.name;

                return instances[key] = oldCreate.call(this, args, ctx);
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
          console.assert(o.name, 'Method must be named');
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
          this.assert(
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
      var cls;

      var parent = foam.core.FObject;

      cls = Object.create(parent);
      cls.prototype = Object.create(parent.prototype);
      cls.prototype.cls_ = cls;
      cls.prototype.model_ = this;
      cls.private_ = { axiomCache: {} };
      cls.axiomMap_ = Object.create(parent.axiomMap_);
      cls.id = this.id;
      cls.package = this.package;
      cls.name = this.name;
      cls.model_ = this;

      cls.installModel(this);

      var values;
      var model = this;

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


foam.CLASS({
  package: 'foam.core',
  name: 'Enum',
  extends: 'Property',

  properties: [
    { name: 'of', required: true },
    [
      'adapt',
      function(old, nu, prop) {
        var type = foam.typeOf(nu);
        if ( type === foam.FObject ) {
          return nu;
        }

        var e = this.__context__.lookup(prop.of);

        if ( type === foam.String ) {
          return e[foam.String.constantize(nu)];
        } else if ( type === foam.Number ) {
          return e.create({ ordinal: nu });
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
