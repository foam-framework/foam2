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
  name: 'String',
  extends: 'Property',

  // documentation: 'StringProperties coerce their arguments into Strings.',

  properties: [
    [ 'adapt', function(_, a) {
        return typeof a === 'function' ? foam.String.multiline(a) :
               typeof a === 'number'   ? String(a) :
               a && a.toString         ? a.toString() :
               '';
      }
    ],
    [ 'value', '' ]
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'Int',
  extends: 'Property',

  properties: [
    'units',
    [ 'value', 0 ],
    [ 'adapt', function adaptInt(_, v) {
        // FUTURE: replace with Math.trunc() when available everywhere.
        return typeof v === 'number' ? ( v > 0 ? Math.floor(v) : Math.ceil(v) ) :
          v ? parseInt(v) :
          0 ;
      }
    ]
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'Date',
  extends: 'Property',

  // documentation: 'Describes properties of type Date.',
  label: 'Date',

  properties: [
    {
      name: 'adapt',
      value: function (_, d) {
        if ( typeof d === 'number' ) return new Date(d);
        if ( typeof d === 'string' ) {
          var ret = new Date(d);

          if ( ret.toUTCString() === 'InvalidDate' ) throw 'Invalid Date: ' + d;

          return ret;
        }
        return d;
      }
    },
    {
      name: 'comparePropertyValues',
      value: function(o1, o2) {
        if ( ! o1 ) return o2 ? -1 : 0;
        if ( ! o2 ) return 1;

        return foam.Date.compare(o1, o2);
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'DateTime',
  extends: 'Date',

  // documentation: 'Describes properties of type DateTime.',
  label: 'Date and time'
});


foam.CLASS({
  package: 'foam.core',
  name:  'Long',
  extends: 'Int',

  // documentation:  'Describes properties of type Long.',
  label: 'Round long numbers'
});


foam.CLASS({
  package: 'foam.core',
  name: 'Float',
  extends: 'Int',

  // documentation:  'Describes properties of type Float.',
  label: 'Decimal numbers',

  properties: [
    [
      'adapt',
      function (_, v) {
        return typeof v === 'number' ? v : v ? parseFloat(v) : 0.0 ;
      }
    ]
  ]
});


/**
 No different than Float for JS, but useful when targeting with other languages.
 **/
foam.CLASS({
  package: 'foam.core',
  name: 'Double',
  extends: 'Float'
});


foam.CLASS({
  package: 'foam.core',
  name: 'Function',
  extends: 'Property',

  // documentation: 'Describes properties of type Function.',
  label: 'Code that can be run',

  properties: [
    [
      'value',
      function() {}
    ],
    [
      'assertValue',
      function(value, prop) {
        this.assert(typeof value === 'function', prop.name, 'Cannot set to non function type.');
      }
    ]
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'Blob',
  extends: 'Property',

  // documentation: 'A chunk of binary data.',
  label: 'Binary data',
});


// FUTURE: to be used by or replaced by Relationship axiom
foam.CLASS({
  package: 'foam.core',
  name: 'Reference',
  extends: 'Property',

  // documentation:  'A foreign key reference to another Entity.',
  label: 'Reference to another object',

  properties: [
    {
      name: 'of',
      value: '',
      // documentation: 'The FOAM sub-type of this property.'
    },
    {
      name: 'subKey',
      value: 'ID',
      // documentation: 'The name of the key (a property of the other object) that this property references.'
    }
  ],
});

// TODO(adam): Better name for this?
foam.CLASS({
  package: 'foam.core',
  name: 'FObjectProperty',
  extends: 'Property',
  properties: [
    {
      name: 'of',
      value: 'FObject'
    },
    {
      name: 'adapt',
      value: function(_, v, prop) {
        var of = foam.lookup(prop.of);


        return of.isInstance(v) ? v :
          ( v.class ? foam.looup(v.class) : of ).create(v);
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.core',
  name: 'StringArray',
  extends: 'Property',

  // documentation: 'An array of String values.',
  label: 'List of text strings',

  properties: [
    {
      name: 'of',
      value: 'String',
      // documentation: 'The FOAM sub-type of this property.'
    },
    [
      'adapt',
      function(_, v, prop) {
        if ( ! Array.isArray(v) ) return v;

        var copy;
        for ( var i = 0 ; i < v.length ; i++ ) {
          if ( typeof v[i] !== 'string' ) {
            if ( ! copy ) copy = v.slice();
            copy[i] = '' + v[i];
          }
        }

        return copy || v;
      }
    ],
    [
      'assertValue',
      function(v, prop) {
        this.assert(Array.isArray(v),
                    prop.name, 'Tried to set StringArray to non-array type.');
        for ( var i = 0 ; i < v.length ; i++ ) {
          this.assert(typeof v[i] === 'string',
                      prop.name, 'Element', i, 'is not a string', v[i]);
        }
      }
    ]
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'Class',
  extends: 'Property',

  // documentation: 'Stores a class, and can accept a class name.',

  properties: [
    {
      /** FUTURE: adding to the default getter/setter chains is difficult
        when we want to preserve the existing behavior but add an additional
        step. This adapt work could be done in a getter that decorates the
        default getter, but dealing with normal and expression cases is necessary
        if writing back the looked-up class instance. */
      name: 'adapt',
      value: function(old, nu, prop) {
        if ( typeof nu === 'string' ) {
          if ( ! nu ) return '';
          var ret = this.__context__.lookup(nu);
          this.assert(ret && ret.isSubClass, 'Invalid class name ' +
             nu + ' specified for ' + prop.name);
          return ret;
        }
        this.assert(typeof nu === 'undefined' || ( nu && nu.isSubClass ),
          'Invalid class specified for ' +
          prop.name);
        return nu;
      }
    }
  ]
});

//TODO(adamvy): Replace Class property with Class2 property.
foam.CLASS({
  package: 'foam.core',
  name: 'Class2',
  extends: 'Property',
  methods: [
    function installInProto(proto) {
      this.SUPER(proto);

      var name = this.name;

      Object.defineProperty(proto, name + '$cls', {
        get: function classGetter() {
          if ( typeof this[name] !== 'string' ) return this[name];
          return this.__context__.lookup(this[name], true);
        }
      });
    }
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'ReferenceArray',
  extends: 'Reference',

  properties: [
    [ 'factory', function() { return []; } ]
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'EMail',
  extends: 'String',
  // FUTURE: verify
  label: 'Email address'
});


foam.CLASS({
  package: 'foam.core',
  name: 'Image',
  extends: 'String',
  // FUTURE: verify
  label: 'Image data or link'
});


foam.CLASS({
  package: 'foam.core',
  name: 'URL',
  extends: 'String',
  // FUTURE: verify
  label: 'Web link (URL or internet address)'
});


foam.CLASS({
  package: 'foam.core',
  name: 'Color',
  extends: 'String',
  label: 'Color'
});


foam.CLASS({
  package: 'foam.core',
  name: 'Password',
  extends: 'String',
  label: 'Password that displays protected or hidden text'
});


foam.CLASS({
  package: 'foam.core',
  name: 'PhoneNumber',
  extends: 'String',
  label: 'Phone number'
});


foam.CLASS({
  package: 'foam.core',
  name: 'Map',
  extends: 'Property',
  properties: [
    ['factory', function() { return {} }],
    'of'
  ]
});


// TODO(adamvy): Remove this once I take the class factory stuff out.
foam.CLASS({
  package: 'foam.core',
  name: 'Promised2',
  extends: 'Property',

  properties: [
    {
      name: 'of',
      required: true
    },
    'methods'
  ],

  methods: [
    function installInClass(cls) {
      var propName = this.name;

      var target = foam.lookup(this.of);

      var methods = target.getAxiomsByClass(foam.core.Method)
          .filter(function(m) { return target.hasOwnAxiom(m.name); });

      if ( this.methods ) {
        methods = methods.filter(function(m) {
          return this.methods.indexOf(m.name) !== -1;
        }.bind(this));
      }

      methods.map(function(m) {
        var name = m.name;
        var returns = m.returns;

        if ( ! returns ) {
          var code = function() {
            var self = this;
            var args = arguments;
            this[propName].then(function(a) {
              a[name].apply(a, args);
            });
          };
        } else if ( returns === 'Promise' ) {
          code = function() {
            var self = this;
            var args = arguments;
            return this[propName].then(function(a) {
              return a[name].apply(a, args);
            });
          };
        } else {
          // TODO(adamvy): Use modelFactories

          var path = m.returns.split('.');
          path[path.length - 1] = 'Promised' + path[path.length - 1];

          var returnClsId = path.join('.');

          if ( ! foam.lookup(returnClsId) ) {
            foam.CLASS({
              package: path.slice(0, path.length - 1).join('.'),
              name: path[path.length - 1]
            });

            // Done in two passes to prevent infinite recursion.
            foam.CLASS({
              refines: returnClsId,
              properties: [
                {
                  class: 'Promised',
                  of: m.returns,
                  name: 'delegate'
                }
              ]
            });
          }

          code = function() {
            var self = this;
            var args = arguments;
            return foam.lookup(returnClsId).create({
              delegate: this[propName].then(function(d) {
                return d[name].apply(d, args);
              })
            });
          };
        }

        foam.Function.setName(code, name);

        return foam.core.Method.create({
          name: name,
          code: code
        });
      }).forEach(function(m) {
        cls.installAxiom(m);
      });

      cls.installAxiom(foam.core.Method.create({
        name: 'sub',
        code: function() {
          var innerSub = Array.from(arguments);
          var topic = innerSub.slice(0, innerSub.length-1);
          innerSub[innerSub.length-1] = foam.Function.bind(function(s) {
            var args = Array.from(arguments).slice(1);
            var c = this.pub.apply(this, args);
            if ( ! c ) s.destroy();
          }, this);

          this[propName].then(function(d) {
            d.sub.apply(d, innerSub);
          });

          return this.SUPER.apply(this, arguments);
        }
      }));
    }
  ]
});
