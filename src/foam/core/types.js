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
  name: 'Int',
  extends: 'Property',

  properties: [
    'units',
    [ 'value', 0 ],
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
    { class: 'Int', name: 'width' },
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

  documentation: 'Describes properties of type DateTime.',
  label: 'Date and time'
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
  name: 'Object',
  extends: 'Property',

  documentation: '',

  properties: [
    {
      name: 'fromJSON',
      value: function(value, ctx) {
        return foam.json.parse(value, null, ctx);
      }
    }
  ]
});


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
      name: 'fromJSON',
      value: function(json, ctx, prop) {
        return foam.json.parse(json, prop.of, ctx);
      }
    },
    {
      name: 'adapt',
      value: function(_, v, prop) {
        var of = foam.lookup(prop.of);

        return of.isInstance(v) ?
            v :
            ( v.class ?
                foam.lookup(v.class) :
                of ).create(v, this.__subContext__);
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'Array',
  extends: 'Property',

  properties: [
    {
      name: 'fromJSON',
      value: function(value, opt_ctx) {
        return foam.json.parse(value, null, opt_ctx);
      }
    }
  ]
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

  methods: [
    function installInProto(proto) {
      this.SUPER(proto);

      var name = this.name;

      Object.defineProperty(proto, name + '$cls', {
        get: function classGetter() {
          if ( typeof this[name] !== 'string' ) return this[name];
          return this.__context__.lookup(this[name], true);
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
  name: 'Map',
  extends: 'Property',

  properties: [
    ['factory', function() { return {} }],
    'of'
  ]
});
