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

// TODO: i18n compatible error messages?

foam.CLASS({
  name: 'Argument',

  documentation: "Describes one argument of a function.",

  constants: {
    PREFIX: 'Argument',
  },

  properties: [
    {
      /** The name of the argument */
      name: 'name'
    },
    {
      /** The string name of the type (either a model name or javascript typeof name) */
      name: 'typeName'
    },
    {
      /** If set, this holds the actual Model represented by typeName. */
      name: 'type'
    },
    {
      /** If true, indicates that this argument is optional. */
      name: 'optional', defaultValue: false
    },
    {
      /** The index of the argument (the first argument is at index 0). */
      name: 'index', defaultValue: -1
    },
    {
      /** The documentation associated with the argument (denoted by a // ) */
      name: 'documentation', defaultValue: ''
    }
  ],

  methods: [
    /** Validates the given argument against this type information.
        If any type checks are failed, a TypeError is thrown.
         */
    function validate(/* any // the argument value to validate. */ arg) {
      i = ( this.index >= 0 ) ? ' '+this.index+', ' : ', ';
      // optional check
      if ( ( ! arg ) && typeof arg === 'undefined' ) {
        if ( ! this.optional ) {
          throw new TypeError(this.PREFIX + i + this.name+', is not optional, but was undefined in a function call');
        } else {
          return; // value is undefined, but ok with that
        }
      }
      // type this for non-modelled types (no model, but a type name specified)
      if ( ! this.type ) {
        if (   this.typeName
            && typeof arg !== this.typeName
            && ! ( this.typeName === 'array' && Array.isArray(arg) ) ) {
          throw new TypeError(this.PREFIX + i + this.name+', expected type '+this.typeName+' but passed '+(typeof arg));
        } // else no this: no type, no typeName
      } else {
        // have a modelled type
        if ( ! arg.cls_ || ! this.type.isInstance(arg) ) {   // TODO: .cls_ check in isInstance() instead?
          var gotType = (arg.cls_) ? arg.cls_.name : typeof arg;
          throw new TypeError(this.PREFIX + i + this.name+', expected type '+this.typeName+' but passed '+gotType);
        }
      }
    }
  ]
});


/** Describes a function return type. */
foam.CLASS({
  name: 'ReturnValue',
  extends: 'Argument',

  constants: {
    PREFIX: 'Return',
  }
});


/** The types library deals with type safety. */
foam.LIB({
  name: 'types',

  methods: [
    function getFunctionArgs(fn) {
      /** Extracts the arguments and their types from the given function.
        * @arg fn The function to extract from. The toString() of the function must be
        *     accurate.
        * @return An array of Argument objects.
        */
      // strip newlines and find the function(...) declaration
      var args = foam.fn.argsStr(fn);
      if ( ! args ) return [];
      args += ','; // easier matching

      var ret = [];
      // check each arg for types
      // Optional commented type(incl. dots for packages), argument name, optional commented return type
      // ws [/* ws package.type? ws */] ws argname ws [/* ws retType ws */]
      //console.log('-----------------');
      var argIdx = 0;
      var argMatcher = /(\s*\/\*\s*([\w._$]+)(\?)?\s*(\/\/\s*(.*?))?\s*\*\/)?\s*([\w_$]+)\s*(\/\*\s*([\w._$]+)\s*\*\/)?\s*\,+/g;
      var typeMatch;
      while ((typeMatch = argMatcher.exec(args)) !== null) {
        // if can't match from start of string, fail
        if ( argIdx == 0 && typeMatch.index > 0 ) break;

        ret.push(/*X.*/Argument.create({
          name: typeMatch[6],
          typeName: typeMatch[2],
          type: global[typeMatch[2]],
          optional: typeMatch[3] == '?',
          argIdx: argIdx++,
          documentation: typeMatch[5],
        }));
        // TODO: this is only valid on the last arg
        if ( typeMatch[6] ) {
          ret.returnType = /*X.*/ReturnValue.create({
            typeName: typeMatch[8],
            type: global[typeMatch[8]]
          });
        }
      }
      if ( argIdx == 0 ) {
        // check for bare return type with no args
        typeMatch = args.match(/^\s*\/\*\s*([\w._$]+)\s*\*\/\s*/);
        if ( typeMatch && typeMatch[1] ) {
          ret.returnType = /*X.*/ReturnValue.create({
            typeName: typeMatch[1],
            type: global[typeMatch[1]]
          });
        } else {
          throw "foam.types.getFunctionArgs argument parsing error: " + args.toString();
        }
      }

      return ret;
    },

    /** Decorates the given function with a runtime type checker.
      * Types should be denoted before each argument:
      * <code>function(\/\*TypeA\*\/ argA, \/\*string\*\/ argB) { ... }</code>
      * Types are either the names of Models (i.e. declared with CLASS), or
      * javascript primitives as returned by 'typeof'. In addition, 'array'
      * is supported as a special case, corresponding to an Array.isArray() check.
      * @fn The function to decorate. The toString() of the function must be
      *     accurate.
      * @return A new function that will throw errors if arguments
      *         doesn't match the declared types, run the original function,
      *         then type check the returned value.
      */
    function typeCheck(fn) {
      // parse out the arguments and their types
      var args = foam.types.getFunctionArgs(fn);
      var ret = function() {
        // check each declared argument, arguments[i] can be undefined for missing optional args,
        // extra arguments are ok
        for (var i = 0; i < args.length; ++i) {
          args[i].validate(arguments[i]);
        }

        // If nothing threw an exception, we are free to run the function
        var retVal = fn.apply(this, arguments);

        // check the return value
        if ( args.returnType ) {
          args.returnType.validate(retVal);
        }

        return retVal;
      }

      // keep the old value of toString (hide the decorator)
      ret.toString = function() { return fn.toString(); }
      return ret;
    }
  ]
});


///////////////////////////////////////////////////////
foam.CLASS({
  name:  'DateProperty',
  package: 'foam.core',
  extends: 'Property',

  documentation:  'Describes properties of type Date.',
  label: 'Date',

  properties: [
    {
      name: 'adapt',
      defaultValue: function (_, d) {
        if (typeof d === 'number') return new Date(d);
        if (typeof d === 'string') {
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
  name: 'DateTimeProperty',
  package: 'foam.core',
  extends: 'DateProperty',

  documentation: 'Describes properties of type DateTime.',
  label: 'Date and time',
});

foam.CLASS({
  name:  'LongProperty',
  package: 'foam.core',
  extends: 'IntProperty',

  documentation:  'Describes properties of type Long.',
  label: 'Round long numbers',
});

foam.CLASS({
  name:  'FloatProperty',
  package: 'foam.core',
  extends: 'IntProperty',

  documentation:  'Describes properties of type Float.',
  label: 'Decimal numbers',

  properties: [
    {
      name: 'adapt',
      defaultValue: function (_, v) {
        return typeof v === 'number' ? v : v ? parseFloat(v) : 0.0 ;
      }
    },
  ]
});

foam.CLASS({
  name:  'FunctionProperty',
  package: 'foam.core',
  extends: 'Property',

  documentation:  'Describes properties of type Function.',
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
  name: 'BlobProperty',
  package: 'foam.core',
  extends: 'Property',
  documentation: 'A chunk of binary data.',
  label: 'Binary data',

  properties: [
    {
      name: 'type',
      type: 'String',
      defaultValue: 'Blob',
      documentation: 'The FOAM type of this property.',
    }
  ]
});

foam.CLASS({
  name:  'ReferenceProperty',
  package: 'foam.core',
  extends: 'Property',

  documentation:  'A foreign key reference to another Entity.',
  label: 'Reference to another object',

  properties: [
    {
      name: 'subType',
      defaultValue: '',
      documentation: 'The FOAM sub-type of this property.'
    },
    {
      name: 'subKey',
      defaultValue: 'ID',
      documentation: 'The foreign key that this property references.'
    },
    // TODO: expression to produce the actual value referenced by this property? or method installed on the host?
  ]
});


foam.CLASS({
  name: 'StringArrayProperty',
  package: 'foam.core',
  extends: 'ArrayProperty',

  documentation: 'An array of String values.',
  label: 'List of text strings',

  properties: [
    {
      name: 'subType',
      defaultValue: 'String',
      documentation: 'The FOAM sub-type of this property.'
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

//   documentation: 'Describes a Model property.',
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
  name: 'ReferenceArrayProperty',
  package: 'foam.core',
  extends: 'ReferenceProperty',

  properties: [
    {
      name: 'factory',
      defaultValue: function() { return []; },
    },
  ]
});

foam.CLASS({
  name: 'EMailProperty',
  package: 'foam.core',
  extends: 'StringProperty',
  label: 'Email address',
});

foam.CLASS({
  name: 'ImageProperty',
  package: 'foam.core',
  extends: 'StringProperty',
  label: 'Image data or link',
});

foam.CLASS({
  name: 'URLProperty',
  package: 'foam.core',
  extends: 'StringProperty',
  label: 'Web link (URL or internet address)',
});

foam.CLASS({
  name: 'ColorProperty',
  package: 'foam.core',
  extends: 'StringProperty',
  label: 'Color',
});

foam.CLASS({
  name: 'PasswordProperty',
  package: 'foam.core',
  extends: 'StringProperty',
  label: 'Password that displays protected or hidden text',
});

foam.CLASS({
  name: 'PhoneNumberProperty',
  package: 'foam.core',
  extends: 'StringProperty',
  label: 'Phone number',
});
