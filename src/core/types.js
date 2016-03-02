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
  name:  'Date',
  extends: 'Property',

  // documentation: 'Describes properties of type Date.',
  label: 'Date',

  properties: [
    {
      name: 'adapt',
      defaultValue: function (_, d) {
        if ( typeof d === 'number' ) return new Date(d);
        if ( typeof d === 'string' ) {
          var ret = new Date(d);
          return ret.toUTCString() === 'Invalid Date' ? new Date(+d) : ret;
        }
        return d;
      }
    },
    {
      name: 'comparePropertyValues',
      defaultValue: function(o1, o2) {
        if ( ! o1 ) return ( ! o2 ) ? 0: -1;
        if ( ! o2 ) return 1;

        return o1.compareTo(o2);
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
  name:  'Float',
  extends: 'Int',

  // documentation:  'Describes properties of type Float.',
  label: 'Decimal numbers',

  properties: [
    {
      name: 'adapt',
      defaultValue: function (_, v) {
        return typeof v === 'number' ? v : v ? parseFloat(v) : 0.0 ;
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.core',
  name:  'Function',
  extends: 'Property',

  // documentation:  'Describes properties of type Function.',
  label: 'Code that can be run',

  properties: [
    {
      name: 'defaultValue',
      defaultValue: function() {}
    },
    {
      name: 'adapt',
      defaultValue: function(_, value) {
        if ( typeof value === 'string' ) {
          var body = /^[\s\r\n]*function[\s\r\n]*\([^]*\)[\s\r\n]*\{([^]*)}/.exec(value);
          body = ( body && body[1] ) ? body[1] : value;
          return new Function(body);
        }
        return value;
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'Blob',
  extends: 'Property',

  // documentation: 'A chunk of binary data.',
  label: 'Binary data',

  properties: [
  ]
});


foam.CLASS({
  package: 'foam.core',
  name:  'Reference',
  extends: 'Property',

  // documentation:  'A foreign key reference to another Entity.',
  label: 'Reference to another object',

  properties: [
    {
      name: 'of',
      defaultValue: '',
      // documentation: 'The FOAM sub-type of this property.'
    },
    {
      name: 'subKey',
      defaultValue: 'ID',
      // documentation: 'The foreign key that this property references.'
    }
    // TODO: expression to produce the actual value referenced by this property? or method installed on the host?
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'StringArray',
  extends: 'Array',

  // documentation: 'An array of String values.',
  label: 'List of text strings',

  properties: [
    {
      name: 'of',
      defaultValue: 'String',
      // documentation: 'The FOAM sub-type of this property.'
    },
    {
      name: 'adapt',
      defaultValue: function(_, v, prop) {
        return Array.isArray(v) ? v :
          ( typeof v === 'string' ) ? prop.fromString(v) :
          ((v || v === 0) ? [v] : []);
      }
    },
    {
      name: 'factory',
      defaultValue: function() { return []; }
    },
    {
      name: 'fromString',
      defaultValue: function(s) {
        return s.split(',');
      }
    }
  ]
});


// foam.CLASS({
//   name: 'ModelProperty',
//   package: 'foam.core',
//   extends: 'Property',

//   // documentation: 'Describes a Model property.',
//   label: 'Data Model definition',

//   properties: [
//     {
//       name: 'getter',
//       defaultValue: function(name) {
//         var value = this.instance_[name];
//         // TODO: this is from foam1 standard getter... grab the foam2 path
//         if ( typeof value === 'undefined' ) {
//           var prop = this.cls_.getAxiomByName(name);
//           if ( prop ) {
//             if ( prop.factory ) {
//               value = this.instance_[prop.name] = prop.factory.call(this, prop);
//             } else if ( typeof prop.defaultValue !== undefined ) {
//               value = prop.defaultValue;
//             } else {
//               value = '';
//             }
//           } else {
//             value = '';
//           }
//         }
//         if ( typeof value === 'string' ) {
//           if ( ! value ) return '';
//           var ret = this.X.lookup(value);
//           // console.assert(Model.isInstance(ret), 'Invalid model specified for ' + this.name_);
//           return ret;
//         }
//         if ( foam.core.Model.isInstance(value) ) return value;
//         return '';
//       }
//     }
//   ]
// });


foam.CLASS({
  package: 'foam.core',
  name: 'ReferenceArray',
  extends: 'Reference',

  properties: [
    {
      name: 'factory',
      defaultValue: function() { return []; }
    }
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'EMail',
  extends: 'String',
  label: 'Email address'
});


foam.CLASS({
  package: 'foam.core',
  name: 'Image',
  extends: 'String',
  label: 'Image data or link'
});


foam.CLASS({
  package: 'foam.core',
  name: 'URL',
  extends: 'String',
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
  name: 'Simple',
  extends: 'Property',

  methods: [
    function installInProto(proto) {}
  ]
});

foam.CLASS({
  package: 'foam.core',
  name: 'Proxy',
  extends: 'Property',
  properties: [
    'of',
    {
      class: 'StringArray',
      name: 'delegates',
      // documentation: 'Methods that we should delegate rather than forward.'
    }
  ],
  methods: [
    function installInClass(cls) {
      this.SUPER(cls);

      var delegate = foam.lookup(this.of);
      var implements = foam.core.Implements.create({ path: this.of });
      if ( ! cls.getAxiomByName(implements.name) )
        cls.installAxiom(implements);

      var name = this.name;
      var methods = delegate.getAxiomsByClass(foam.core.Method)
          .filter(function(m) {
            // TODO This isn't the right check, but we need some sort of filter.
            // We dont' want to proxy all FObject methods, only those defined in the interface
            // and possibly its parent interfaces?
            return delegate.hasOwnAxiom(m.name);
          }).map(function(m) {
            m = m.clone();
            m.code = this.delegates.indexOf(m.name) == -1 ?
              Function("return this." + name + "." + m.name + ".apply(this.delegate, arguments);") :
              Function("return this." + name + "." + m.name + ".apply(this, arguments);");
            cls.installAxiom(m);
          }.bind(this));
    }
  ]
});
