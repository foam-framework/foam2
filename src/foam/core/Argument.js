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
      var retMapByName = {};
      // check each arg for types
      // Optional commented type(incl. dots for packages), argument name,
      // optional commented return type
      // ws [/* ws package.type? ws */] ws argname ws [/* ws retType ws */]
      var argIdx = 0;
      var argMatcher = /(\s*\/\*\s*([\w._$\[\]]+)(\?)?(\*)?\s*(\/\/\s*(.*?))?\s*\*\/)?\s*([\w_$]+)\s*(\/\*\s*([\w._$]+)\s*\*\/)?\s*\,+/g;
      var typeMatch;

      function resolveType(typeStr) {
        // TODO: core foam to have a warning here, if no typeName specified
        // User code should be allowed to omit types.
        if ( ! typeStr ) return undefined;
        
        typeStr = typeStr.trim();
        if ( typeStr.substring(typeStr.length - 2) === '[]' ) {
          return foam.Array;
        }

        var cls = foam.lookup(typeStr, true);
        if ( cls ) return cls;
        
        // otherwise look for foam.<primitive> type
        if ( typeStr.indexOf('foam.') === 0 ) {
          cls = foam[typeStr.split('.')[1]];
          if ( cls ) return cls;
        }
        
        // could not resolve
        throw new TypeError(
          'foam.Function.args could not resolve type ' + typeStr+ '\n' +
          'For function:\n' +
          fn.toString() + '\n'
        );
      };

      while ( typeMatch = argMatcher.exec(args) ) {
        // if can't match from start of string, fail
        if ( argIdx == 0 && typeMatch.index > 0 ) break;

        if ( ret.returnType ) {
          throw new SyntaxError('foam.Function.args return type \'' +
            ret.returnType.typeName +
            '\' must appear after the last argument only: ' + 
            args.toString() + '\n' +
            'For function:\n' +
            fn.toString() + '\n'
          
          );
        }

        // record the argument
        var arg = foam.core.Argument.create({
          name:          typeMatch[7],
          typeName:      typeMatch[2],
          type:          resolveType(typeMatch[2]),
          optional:      true, //typeMatch[3] == '?',
          repeats:       typeMatch[3] == '*',
          index:         argIdx++,
          documentation: typeMatch[6]
        });
        ret.push(arg);
        retMapByName[arg.name] = arg;

        // if present, record return type (if not the last arg, we fail on the
        // next iteration)
        if ( typeMatch[9] ) {
          ret.returnType = foam.core.Argument.create({
            name: 'ReturnValue',
            typeName: typeMatch[9],
            type: resolveType(typeMatch[9])
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
            type: resolveType(typeMatch[1])
          });
        } else {
          throw new SyntaxError(
              'foam.Function.args argument parsing error:\n' +
              args.toString() + '\n' +
            'For function:\n' +
            fn.toString() + '\n'
          );
        }
      }

      // Also pull args out of the documentation comment (if inside the body
      // so we can access it)
      var comment = foam.Function.functionComment(fn);
      if ( comment ) {
        // match @arg or @param {opt_type} arg_name
        var commentMatcher = /.*(\@arg|\@param|\@return)\s+(?:\{(.*?)\}\s+)?(.*?)\s+(?:([^\@]*))?/g;
        var commentMatch;
        while ( commentMatch = commentMatcher.exec(comment) ) {
          var name = commentMatch[3];
          var type = commentMatch[2];
          var docs = commentMatch[4] && commentMatch[4].trim();

          if ( commentMatch[1] === '@return' ) {
            if ( ret.returnType ) {
              throw new SyntaxError(
                  'foam.types.getFunctionArgs duplicate return type ' +
                  'definition in block comment: \"' +
                  type + '\" from \:\n' + fn.toString());
            }
            ret.returnType = foam.core.Argument.create({
              name: 'ReturnValue',
              typeName: type,
              type: foam.lookup(type, true),
              documentation: docs
            });
          } else {
            // check existing args
            if ( retMapByName[name] ) {
              if ( retMapByName[name].typeName ) {
                throw new SyntaxError(
                    'foam.types.getFunctionArgs duplicate argument ' +
                    'definition in block comment: \"' +
                    name + '\" from:\n' + fn.toString());
              }
              retMapByName[name].typeName = type;
              retMapByName[name].documentation = docs;
            } else {
              var arg = foam.core.Argument.create({
                name:          name,
                typeName:      type,
                type:          foam.lookup(type, true),
                index:         argIdx++,
                documentation: docs
              });
              ret.push(arg);
              retMapByName[arg.name] = arg;
            }
          }
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
        (either a model name or foam.String, foam.Function, etc. or [])
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
    function validate(arg) {
      /**
        Validates the given argument against this type information.
        If any type checks are failed, a TypeError is thrown.
       */
      if ( ! this.type ) {
        // no type, no check to perform
        return;
      }
      
      i = ( this.index >= 0 ) ? ' ' + this.index + ', ' : ', ';

      // optional check
      if ( foam.Null.isInstance(arg) || foam.Undefined.isInstance(arg) ) {
        if ( ! this.optional ) {
          throw new TypeError(
              'Argument ' + i + this.name +
              ', is not optional, but was undefined in a function call');
        }

        return; // value is undefined, but ok with that
      }

      // have a modelled type
      if ( ! this.type.isInstance(arg) ) {
        var gotType = (arg.cls_) ? arg.cls_.name : typeof arg;
        throw new TypeError(
            'Argument ' + i + this.name +
            ', expected type ' + this.typeName + ' but passed ' + gotType);
      }
    }
  ]
});
