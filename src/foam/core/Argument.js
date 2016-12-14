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

foam.LIB({
  name: 'foam.Function',

  methods: [
    function args(fn) {
      /** Extracts the arguments and their types from the given function.
        * @param fn The function to extract from. The toString() of the function
        *     must be accurate.
        * @return An array of Argument objects.
        */
      // strip newlines and find the function(...) declaration
      var args = foam.Function.argsStr(fn);

      if ( ! args ) return [];

      args += ','; // easier matching

      var ret = [];
      // check each arg for types
      // Optional commented type(incl. dots for packages), argument name,
      // optional commented return type
      // ws [/* ws package.type? ws */] ws argname ws [/* ws retType ws */]
      //console.log('-----------------');
      var argIdx = 0;
      var argMatcher = /(\s*\/\*\s*([\w._$]+)(\?)?(\*)?\s*(\/\/\s*(.*?))?\s*\*\/)?\s*([\w_$]+)\s*(\/\*\s*([\w._$]+)\s*\*\/)?\s*\,+/g;
      var typeMatch;

      while ( typeMatch = argMatcher.exec(args) ) {
        // if can't match from start of string, fail
        if ( argIdx == 0 && typeMatch.index > 0 ) break;

        if ( ret.returnType ) {
          throw new SyntaxError("foam.types.args return type '" +
            ret.returnType.typeName +
            "' must appear after the last argument only: " + args.toString());
        }

        // record the argument
        ret.push(foam.core.Argument.create({
          name:          typeMatch[7],
          typeName:      typeMatch[2],
          type:          global[typeMatch[2]],
          optional:      true, //typeMatch[3] == '?',
          repeats:       typeMatch[3] == '*',
          index:         argIdx++,
          documentation: typeMatch[6]
        }));

        // if present, record return type (if not the last arg, we fail on the
        // next iteration)
        if ( typeMatch[9] ) {
          ret.returnType = foam.core.Argument.create({
            name: 'ReturnValue',
            typeName: typeMatch[9],
            type: global[typeMatch[9]]
          });
        }
      }

      if ( argIdx == 0 ) {
        // check for bare return type with no args
        typeMatch = args.match(/^\s*\/\*\s*([\w._$]+)\s*\*\/\s*/);
        if ( typeMatch && typeMatch[1] ) {
          ret.returnType = foam.core.Argument.create({
            name: 'ReturnValue',
            typeName: typeMatch[1],
            type: global[typeMatch[1]]
          });
        } else {
          throw new SyntaxError(
              'foam.types.args argument parsing error: ' +
              args.toString());
        }
      }

      return ret;
    }
  ]
});


/** Describes one argument of a function or method. */
foam.CLASS({
  package: 'foam.core',
  name: 'Argument',

  constants: {
    PREFIX: 'Argument'
  },

  properties: [
    {
      /** The name of the argument */
      name: 'name'
    },
    {
      /**
        The string name of the type
        (either a model name or javascript typeof name)
      */
      name: 'typeName'
    },
    {
      /** If set, this holds the actual Model represented by typeName. */
      name: 'type'
    },
    {
      /** If true, indicates that this argument is optional. */
      name: 'optional', value: false
    },
    {
      /** If true, indicates a variable number of arguments. */
      name: 'repeats', value: false
    },
    {
      /** The index of the argument (the first argument is at index 0). */
      name: 'index', value: -1
    },
    {
      /** The documentation associated with the argument (denoted by a // ) */
      name: 'documentation', value: ''
    }
  ],

  methods: [
    /**
      Validates the given argument against this type information.
      If any type checks are failed, a TypeError is thrown.
     */
    function validate(/* any // the argument value to validate. */ arg) {
      i = ( this.index >= 0 ) ? ' ' + this.index + ', ' : ', ';

      // optional check
      if ( ( ! arg ) && typeof arg === 'undefined' ) {
        if ( ! this.optional ) {
          throw new TypeError(
              this.PREFIX + i + this.name +
              ', is not optional, but was undefined in a function call');
        }

        return; // value is undefined, but ok with that
      }

      // type this for non-modelled types (no model, but a type name specified)
      if ( ! this.type ) {
        if ( this.typeName
            && typeof arg !== this.typeName
            && ! ( this.typeName === 'array' && Array.isArray(arg) ) ) {
          throw new TypeError(
              this.PREFIX + i + this.name +
              ', expected type ' + this.typeName + ' but passed ' + (typeof arg));
        } // else no this: no type, no typeName
      } else {
        // have a modelled type
        if ( ! this.type.isInstance(arg) ) {
          var gotType = (arg.cls_) ? arg.cls_.name : typeof arg;
          throw new TypeError(
              this.PREFIX + i + this.name +
              ', expected type ' + this.typeName + ' but passed ' + gotType);
        }
      }
    }
  ]
});
