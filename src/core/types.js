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
          // TODO: doc, throw Exception
          return ret.toUTCString() === 'Invalid Date' ? new Date(+d) : ret;
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

  methods: [
    function installInProto(proto) {
      this.SUPER(proto);

      // TODO(js): expression to produce the actual value referenced by
      // this property? or method installed on the host?

    }
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'StringArray',
  extends: 'FObjectArray',

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
        this.assert(Array.isArray(v), 'Attempt to set Array property to non-Array value.', v);
        return v;
      }
    ],
    [
      'factory',
      function() { return []; }
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
          var ret = this.X.lookup(nu);
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


//TODO(adamvy): document
foam.CLASS({
  package: 'foam.core',
  name: 'Proxy',
  extends: 'Property',

  properties: [
    { name: 'of', required: true },
    {
      // TODO(adamvy): Support narrow down to sub-topics
      class: 'StringArray',
      name: 'topics'
    },
    {
      class: 'StringArray',
      name: 'methods'
    },
    {
      name: 'delegates',
      expression: function() { return []; }
      // documentation: 'Methods that we should delegate rather than forward.'
    }
  ],

  methods: [
    function installInClass(cls) {
      this.SUPER(cls);

      var delegate = foam.lookup(this.of);
      var implements = foam.core.Implements.create({ path: this.of });
      if ( ! cls.getAxiomByName(implements.name) ) cls.installAxiom(implements);

      var name = this.name;
      var methods = ! this.methods ? [] :
          this.methods.length ? this.methods.map(function(f) {
            var m = delegate.getAxiomByName(f);
            foam.X.assert(foam.core.Method.isInstance(m), 'Cannot proxy non-method', f);
            return m;
          }) :
          delegate.getAxiomsByClass(foam.core.Method).filter(function(m) {
            // TODO(adamvy): This isn't the right check, but we need some sort of filter.
            // We dont' want to proxy all FObject methods, only those defined in the interface
            // and possibly its parent interfaces?
            return delegate.hasOwnAxiom(m.name);
          });

      methods = methods.forEach(function(m) {
        m = m.clone();
        m.code = this.delegates.indexOf(m.name) == -1 ?
          Function("return this." + name + "." + m.name + ".apply(this." + name + ", arguments);") :
          Function("return this." + name + "." + m.name + ".apply(this, arguments);");
        cls.installAxiom(m);
      }.bind(this));

      var name = this.name;

      cls.installAxiom(foam.core.Method.create({
        name: 'sub',
        code: function() {
          var innerSub = foam.Function.appendArguments([], arguments, 0);
          var topic = innerSub.slice(0, innerSub.length-1);
          innerSub[innerSub.length-1] = foam.Function.bind(function(s) {
            var args = foam.Function.appendArguments([], arguments, 1);
            var c = this.pub.apply(this, args);
            if ( ! c ) s.destroy();
          }, this);

          this[name].sub.apply(this[name], innerSub);

          return this.SUPER.apply(this, arguments);
        }
      }));
    }
  ]
});


foam.CLASS({
  package: 'foam.core.fsm',
  name: 'State',

  properties: [
    {
      name: 'name',
      expression: function(className) {
        return className.substring(className.lastIndexOf('.') + 1);
      }
    },
    'className'
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'StateMachine',
  extends: 'Proxy',

  properties: [
    'plural',
    {
      class: 'FObjectArray',
      of: 'foam.core.fsm.State',
      name: 'states',
      adaptArrayElement: function(s) {
        return typeof s == "string" ?
          foam.lookup(this.of).create({ className: s }) :
          foam.lookup(this.of).create(s);
      }
    },
    {
      name: 'factory',
      expression: function(plural, states) {
        var initial = foam.String.constantize(plural);
        var state = foam.String.constantize(states[0].name);
        return function() {
          return this[initial][state];
        };
      }
    },
    [ 'postSet', function(o, s) { if ( s.onEnter ) s.onEnter.call(this, o); } ],
    [ 'preSet', function(o, s) {
      if ( o && o.onLeave ) o.onLeave.call(this, s);
      return s;
    }],
    {
      name: 'delegates',
      expression: function(of) {
        var intf = foam.lookup(of);
        return intf.getAxiomsByClass(foam.core.Method)
          .filter(function(m) { return intf.hasOwnAxiom(m.name); })
          .map(function(m) { return m.name; });
      }
    }
  ],

  methods: [
    function installInClass(cls) {
      this.SUPER(cls);

      var of = this.of;
      var self = this;

      var states = {};
      this.states.forEach(function(state) {
        var name = state.name;
        var className = state.className;
        Object.defineProperty(states, foam.String.constantize(state.name), {
          get: (function() {
            var value;
            return function() {
              if ( ! value ) {
                value = this[state.name] ?
                  this[state.name].create() :
                  foam.lookup(state.className).create();
              }
              return value;
            };
          })()
        });
      });

      states = foam.core.Constant.create({
        name: foam.String.constantize(this.plural),
        value: states
      });
      cls.installAxiom(states);

      // var states = this.states.map(function(m) {
      //   return foam.core.Constant.create({
      //     name: foam.String.constantize(self.name + m.name),
      //     value: foam.lookup(m.className).create()
      //   });
      // });

      // for ( var i = 0 ; i < states.length ; i++ ) {
      //   cls.installAxiom(states[i]);
      // }
      this.SUPER(cls);
    }
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'Promised',
  extends: 'Property',
  properties: [
    {
      name: 'of',
      required: true
    }
  ],
  methods: [
    function installInClass(cls) {
      var propName = this.name;

      var target = foam.lookup(this.of);

      var methods = target.getAxiomsByClass(foam.core.Method)
          .filter(function(m) { return target.hasOwnAxiom(m.name); })
          .map(function(m) {
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
              // TODO: Use modelFactories

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
    }
  ]
});
