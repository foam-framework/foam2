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
    (function() {
      var ret = function resolveTypeString(typeStr) {
        /** Looks up a type as a FOAM class, stdlib String, Number, etc., or 'any' */
        // missing types are checked for _after_ the body comment is checked
        if ( ! typeStr ) return undefined;

        typeStr = typeStr.trim();
        if ( typeStr.substring(typeStr.length - 2) === '[]' ) {
          return foam.Array;
        }
        if ( typeStr === 'any' || typeStr == '``' ) {
          return undefined;
        }

        // otherwise look for foam.<primitive> type
        cls = foam[typeStr];
        if ( cls ) return cls;

        var cls = foam.lookup(typeStr, true);
        if ( cls ) return cls;

        // could not resolve
        throw new TypeError('foam.Function.resolveTypeString could not resolve type ' +
          typeStr);
      };
      ret.isTypeChecked__ = true;
      return ret;
    })(),

    function args(fn) {
      /**
       * Extracts the arguments and their types from the given function.
       * @param {Function} fn The function to extract from. The toString() of the function
       *     must be accurate.
       * @return {Array} An array of Argument objects.
       */
      // strip newlines and find the function(...) declaration
      if ( fn.args ) return fn.args;
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
      var argMatcher = /(\s*\/\*\s*(\.\.\.)?([\w._$\[\]]+)(\=)?\s*(\/\/\s*(.*?))?\s*\*\/)?\s*(\.\.\.)?([\w_$]+)\s*(\/\*\s*([\w._$\[\]`]*)(\?)?\s*\*\/)?\s*\,+/g;
      var typeMatch;

      while ( typeMatch = argMatcher.exec(args) ) {
        // if can't match from start of string, fail
        if ( argIdx === 0 && typeMatch.index > 0 ) break;

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
          name:          typeMatch[8],
          typeName:      typeMatch[3],
          type:          this.resolveTypeString(typeMatch[3]),
          optional:      true, //typeMatch[4] === '=', // TODO: mandatory
          repeats:       typeMatch[2] === '...' || typeMatch[7] === '...',
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
            optional: typeMatch[11],
            typeName: typeMatch[10]
          });
        }
      }

      if ( argIdx === 0 ) {
        // check for bare return type with no args
        typeMatch = args.match(/^\s*\/\*\s*([\w._$\[\]]+)(\=)?\s*\*\/\s*/);
        if ( typeMatch && typeMatch[1] ) {
          foam.assert(! ret.returnType,
            'foam.Function.args found two return types: ' + fn.toString());
          ret.returnType = foam.core.Argument.create({
            name: 'ReturnValue',
            optional: typeMatch[2] === '=',
            typeName: typeMatch[1]
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
        var commentMatcher = /.*(\@arg|\@param|\@return)\s+(?:\{(\.\.\.)?([\w._$\[\]]+)(\=)?\}\s+)?(.*?)\s+(?:([^\@]*))?/g;
        var commentMatch;
        while ( commentMatch = commentMatcher.exec(comment) ) {
          var name     = commentMatch[5];
          var optional = commentMatch[4] === '=';
          var repeats  = commentMatch[2] === '...';
          var type     = commentMatch[3];
          var docs     = commentMatch[6] && commentMatch[6].trim();

          if ( commentMatch[1] === '@return' ) {
            if ( ret.returnType ) {
              throw new SyntaxError(
                  'foam.Function.args duplicate return type ' +
                  'definition in block comment: \"' +
                  type + '\" from \:\n' + fn.toString());
            }

            ret.returnType = foam.core.Argument.create({
              name: 'ReturnValue',
              optional: optional,
              repeats: repeats,
              typeName: type,
              type: this.resolveTypeString(type),
              documentation: docs
            });
          } else {
            // check existing args
            if ( retMapByName[name] ) {
              if ( retMapByName[name].typeName ) {
                throw new SyntaxError(
                    'foam.Function.args duplicate argument ' +
                    'definition in block comment: \"' +
                    name + '\" from:\n' + fn.toString());
              }

              retMapByName[name].typeName      = type;
              retMapByName[name].optional      = optional;
              retMapByName[name].repeats       = repeats;
              retMapByName[name].documentation = docs;
              retMapByName[name].type          = this.resolveTypeString(type);
            } else {
              var arg = foam.core.Argument.create({
                name:          name,
                optional:      optional,
                repeats:       repeats,
                typeName:      type,
                index:         argIdx++,
                documentation: docs
              });
              ret.push(arg);
              retMapByName[arg.name] = arg;
            }
          }
        }
      }

      // Check for missing types
      var missingTypes = [];
      for ( var i = 0; i < ret.length; i++ ) {
        if ( ! ret[i].typeName ) missingTypes.push(ret[i].name);
      }

      if ( missingTypes.length ) {
        //(this.warn || console.warn)('Missing type(s) for ' +
        //  missingTypes.join(', ') + ' in:\n' + fn.toString());
      }

      return ret;
    }
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'Argument',

  documentation: 'Describes one argument of a function or method.',

  properties: [
    {
      /** The name of the argument */
      name: 'name'
    },
    {
      name: 'of'
    },
    {
      /**
       * The string name of the type
       * (either a model name or foam.String, foam.Function, etc. or [])
       */
      name: 'typeName'
    },
    {
      /**
       * If set, this holds the actual FOAM Class or LIB represented
       * by typeName.
       */
      name: 'type',
      factory: function() {
        return foam.Function.resolveTypeString(this.typeName) || null;
      }
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
    (function() {
      var validate = function validate(arg) {
        /**
          Validates the given argument against this type information.
          If any type checks are failed, a TypeError is thrown.
         */
        if ( ! this.type ) {
          // no type, no check to perform
          return;
        }

        var i = ( this.index >= 0 ) ? ' ' + this.index + ', ' : ', ';

        // optional check
        if ( foam.Null.isInstance(arg) || foam.Undefined.isInstance(arg) ) {
          if ( ! this.optional ) {
            throw new TypeError(
              'Argument ' + i + this.name + ' {' + this.typeName + '}' +
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
      };

      validate.isTypeChecked__ = true; // avoid type checking this method
      return validate;
    })()
  ]
});

foam.CLASS({
  refines: 'foam.core.Method',
  properties: [
    {
      class: 'FObjectArray',
      of: 'foam.core.Argument',
      name: 'args',
      adaptArrayElement: function(e, obj) {
        var ctx = obj.__subContext__ || foam;
        var of = e.class || this.of;
        var cls = ctx.lookup(of);

        return cls.isInstance(e) ? e :
          foam.String.isInstance(e) ? cls.create({ name: e }) :
          cls.create(e, obj);
      }
    }
  ]
});

foam.CLASS({
  refines: 'foam.core.AbstractMethod',
  package: 'foam.core',
  name: 'CreateChildRefines',
  documentation: `
    Overwrites the createChildMethod_ to merge in details from the parent method
    into the child method like return types, arguments, and any other method
    properties. This allows a model to not need to list these details when
    implementing an interface or overriding a parent's method.
  `,
  methods: [
    function createChildMethod_(child) {
      var result = child.clone();
      var props = child.cls_.getAxiomsByClass(foam.core.Property);
      for ( var i = 0 ; i < props.length ; i++ ) {
        var prop = props[i];
        if ( this.hasOwnProperty(prop.name) && ! child.hasOwnProperty(prop.name) ) {
          prop.set(result, prop.get(this));
        }
      }

      // Special merging behaviour for args.
      var i = 0;
      var resultArgs = [];
      for ( ; i < this.args.length ; i++ ) resultArgs.push(this.args[i].clone().copyFrom(child.args[i]));
      for ( ; i < child.args.length ; i++ ) resultArgs.push(child.args[i]);
      result.args = resultArgs; // To trigger the adaptArrayElement

      return result;
    },
  ]
});
