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
foam.CLASS({
  package: 'foam.core',
  name: 'Int',
  extends: 'Property',

  properties: [
    'units',
    [ 'value', 0 ],
    'min',
    'max',
    [ 'adapt', function adaptInt(_, v) {
        return typeof v === 'number' ? Math.trunc(v) :
          v ? parseInt(v) :
          0 ;
      }
    ],
    [ 'fromString', function intFromString(str) {
        return str ? parseInt(str) : 0;
      }
    ]
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'String',
  extends: 'Property',

  documentation: 'StringProperties coerce their arguments into Strings.',

  properties: [
    { class: 'Int', name: 'width', value: 30 },
    [ 'adapt', function(_, a) {
        return typeof a === 'function' ? foam.String.multiline(a) :
               typeof a === 'number'   ? String(a)                :
               a && a.toString         ? a.toString()             :
                                         ''                       ;
      }
    ],
    [ 'value', '' ]
  ]
});


foam.CLASS({
  refines: 'foam.core.Model',

  documentation: 'Upgrade Mode.documentation to a proper String property.',

  properties: [
    { class: 'String', name: 'documentation' }
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

          if ( isNaN(ret.getTime()) ) throw 'Invalid Date: ' + d;

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

  documentation: 'Describes properties of type DateTime.',
  label: 'Date and time'
});


foam.CLASS({
  package: 'foam.core',
  name: 'Byte',
  extends: 'Int',

  documentation: 'Describes properties of type Byte.',
  label: 'Round byte numbers'
});


foam.CLASS({
  package: 'foam.core',
  name: 'Short',
  extends: 'Int',

  documentation: 'Describes properties of type Short.',
  label: 'Round short numbers'
});


foam.CLASS({
  package: 'foam.core',
  name:  'Long',
  extends: 'Int',

  documentation:  'Describes properties of type Long.',
  label: 'Round long numbers'
});


foam.CLASS({
  package: 'foam.core',
  name: 'Float',
  extends: 'Int',

  // documentation:  'Describes properties of type Float.',
  label: 'Decimal numbers',

  properties: [
    'precision',
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

  documentation: 'Describes properties of type Function.',
  label: 'Code that can be run',

  properties: [
    [
      'value',
      function() {}
    ],
    [
      'assertValue',
      function(value, prop) {
        foam.assert(typeof value === 'function', prop.name, 'Cannot set to non function type.');
      }
    ]
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'Object',
  extends: 'Property',
  documentation: ''
});


foam.CLASS({
  package: 'foam.core',
  name: 'Array',
  extends: 'Property',

  properties: [
    [
      'factory',
      function() { return []; }
    ],
    [
      'isDefaultValue',
      function(v) { return ! v || ! v.length; }
    ]
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'List',
  extends: 'foam.core.Object'
});


foam.CLASS({
  package: 'foam.core',
  name: 'StringArray',
  extends: 'Property',

  documentation: 'An array of String values.',
  label: 'List of text strings',

  properties: [
    {
      name: 'of',
      value: 'String',
      documentation: 'The FOAM sub-type of this property.'
    },
    [
      'factory',
      function() { return []; }
    ],
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
        if ( v === null ) return;

        foam.assert(Array.isArray(v),
            prop.name, 'Tried to set StringArray to non-array type.');
        for ( var i = 0 ; i < v.length ; i++ ) {
          foam.assert(typeof v[i] === 'string',
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

  properties: [
    [ 'getter', function(prop) {
        var c = this.instance_[prop.name];

        // Implement value and factory support.
        if ( foam.Undefined.isInstance(c) ) {
          if ( ! foam.Undefined.isInstance(prop.value) ) {
            c = prop.value;
          } else if ( prop.factory ) {
            c = this.instance_[prop.name] = prop.factory.call(this, prop);
          }
        }

        // Upgrade Strings to actual classes, if available.
        if ( foam.String.isInstance(c) ) {
          c = this.lookup(c, true);
          if ( c ) {
            this.instance_[prop.name] = c;
          } else {
            console.error('Unknown class: ' + c);
          }
        }

        return c;
      }
    ],
    ['toJSON', function(value) { return value ? value.id : value; } ]
  ],

  methods: [
    function installInProto(proto) {
      this.SUPER(proto);

      var name = this.name;

      Object.defineProperty(proto, name + '$cls', {
        get: function classGetter() {
          console.warn("Deprecated use of 'cls.$cls'. Just use 'cls' instead.");
          return typeof this[name] !== 'string' ? this[name] :
            this.__context__.lookup(this[name], true);
        },
        configurable: true
      });
    }
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
  name: 'Currency',
  extends: 'Long'
});


foam.CLASS({
  package: 'foam.core',
  name: 'Map',
  extends: 'Property',

  // TODO: Remove need for sorting
  properties: [
    [ 'factory', function() { return {} } ],
    [
      'comparePropertyValues',
      function(o1, o2) {
        if ( foam.typeOf(o1) != foam.typeOf(o2) ) return -1;

        var keys1 = Object.keys(o1).sort();
        var keys2 = Object.keys(o2).sort();
        if ( keys1.length < keys2.length ) return -1;
        if ( keys1.length > keys2.length ) return 1;
        for ( var i = 0 ; i < keys1.length ; i++ ) {
          var c = foam.String.compare(keys1[i], keys2[i]);
          if ( c != 0 ) return c;
          c = foam.util.compare(o1[keys1[i]], o2[keys2[i]]);
          if ( c != 0 ) return c;
        }

        return 0;
      }
    ],
    [
      'cloneProperty',
      function(value, cloneMap) {
        if ( value ) {
          var tmp = cloneMap[this.name] = {};
          for ( var key in value ) {
            tmp[key] = value[key];
          }
        }
      }
    ],
    [
      'diffPropertyValues',
      function(o1, o2) {
        // TODO
      }
    ],
    'of'
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'FObjectProperty',
  extends: 'Property',

  properties: [
    {
      class: 'Class',
      name: 'of',
      value: 'foam.core.FObject'
    },
    {
      name: 'fromJSON',
      value: function(json, ctx, prop) {
        return foam.json.parse(json, prop.of, ctx);
      }
    },
    {
      name: 'adapt',
      value: function(_, v, prop) {
        // All FObjects may be null.
        if (v === null) return v;

        var of = prop.of;

        return of.isInstance(v) ?
            v :
            ( v.class ?
                this.lookup(v.class) :
                of ).create(v, this.__subContext__);
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'Reference',
  extends: 'Property',

  properties: [
    {
      class: 'Class',
      name: 'of'
    },
    {
      class: 'String',
      name: 'targetDAOKey',
      expression: function(of) { return foam.String.daoize(of.name); }
    },
    {
      name: 'adapt',
      value: function(oldValue, newValue, prop) {
        return prop.of.isInstance(newValue) ?
          newValue.id :
          newValue ;
      }
    }
  ],

  methods: [
    function installInProto(proto) {
      this.SUPER(proto);
      var key  = this.targetDAOKey;
      var name = this.name;

      Object.defineProperty(proto, name + '$find', {
        get: function classGetter() {
          return this.__context__[key].find(this[name]);
        },
        configurable: true
      });
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.Model',

  documentation: 'Update Model Property types.',

  properties: [
    { class: 'String',  name: 'name' },
    { class: 'Boolean', name: 'abstract' }
  ]
});


foam.CLASS({
  refines: 'Property',

  axioms: [
    foam.pattern.Faceted.create()
  ],

  properties: [
    {
      name: 'of'
    }
  ]
});


foam.CLASS({
  refines: 'Property',

  properties: [
    /**
      A short-name is an optional shorter name for a property.
      It is used by JSON and XML support when 'useShortNames'
      is enabled. Short-names enable output to be smaller,
      which can save disk space and/or network bandwidth.
      Ex.
    <pre>
      properties: [
        { name: 'firstName', shortName: 'fn' },
        { name: 'lastName',  shortName: 'ln' }
      ]
    </pre>
    */
    { class: 'String', name: 'shortName' }
  ]
});
