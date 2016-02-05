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

if ( ! foam.types ) foam.types = {};

// TODO: i18n compatible error messages?

CLASS({
  name: 'Argument',
  
  constants: {
    PREFIX: 'Argument',
  },
  
  properties: [
    { name: 'name' },
    { name: 'typeName' },
    { name: 'type' },
    { name: 'optional', defaultValue: false },
  ],
  
  methods: [
    /** If any type checks are failed, a TypeError is thrown.
        @param i optional argument index for error reporting. */
    function check(arg, i) {
      i = i ? ''+i+', ' : '';
      // optional check
      if ( ( ! arg ) && typeof arg === 'undefined' && ! this.optional ) {
        throw new TypeError(this.PREFIX+' '+i + this.name+', is not optional, but was undefined in a function call.');
      }
      // type this for non-modelled types (no model, but a type name specified)
      if ( ! this.type ) {
        if ( this.typeName && typeof arg !== this.typeName ) {
          throw new TypeError(this.PREFIX+' '+i + this.name+', expected type '+this.typeName+' but passed '+(typeof arg)+'.');
        } // else no this: no type, no typeName
      } else {
        // have a modelled type
        if ( ! this.type.isInstance(arg) ) {        
          var gotType = (arg.cls_) ? arg.cls_.name : typeof arg;  
          throw new TypeError(this.PREFIX+' '+i + this.name+', expected type '+this.typeName+' but passed '+gotType+'.');
        }
      }
    }
  ]
});

CLASS({
  name: 'ReturnValue',
  extends: 'Argument',
  
  constants: {
    PREFIX: 'Return',
  }
});

/** Extracts the arguments and their types from the given function.
  * @fn The function to extract from. The toString() of the function must be
  *     accurate.
  * @return An array of Argument objects.
  */
foam.types.getFunctionArgs = function getFunctionArgs(fn) {
  
  var args = fn.toString().match(/^function[ _$\w]*\((.*)\)/)[1];
  if ( args )
    args = args.split(',').map(function(name) { return name.trim(); });
  else
    return [];
  
  var ret = [];
  // check each arg for types
  args.forEach(function(arg) {
    // Optional commented type(incl. dots for packages), argument name, optional commented return type
    // ws [/* ws package.type? ws */] ws argname ws [/* ws retType ws */]
    var typeMatch = arg.match(/^\s*(\/\*\s*([\w\.]+)(\?)?\s*\*\/)?\s*(\w+)\s*(\/\*\s*([\w\.]+)\s*\*\/)?\s*/);
    if ( typeMatch ) {
      ret.push(/*X.*/Argument.create({
        name: typeMatch[4],
        typeName: typeMatch[2],
        type: global[typeMatch[2]],
        optional: typeMatch[3] == '?'
      }));
      // TODO: this is only valid on the last arg
      if ( typeMatch[6] ) {
        ret.returnType = /*X.*/ReturnValue.create({
          typeName: typeMatch[6],
          type: global[typeMatch[6]]
        });
      }
    } else {
      throw "foam.types.getFunctionArgs argument parsing error: " + typeMatch.toString();
    } 
  });

  return ret;
}

/** Decorates the given function with a runtime type checker.
  * @fn The function to decorate. The toString() of the function must be
  *     accurate.
  * @return A new function that will throw errors if arguments or the return
  *         doesn't match the declared types, and run the original function.
  */
foam.types.typeCheck = function typeCheck(fn) {
  // parse out the arguments and their types
  var args = foam.types.getFunctionArgs(fn);
  var ret = function() {
    // check each incoming argument
    for (var i = 0; i < arguments.length; ++i) {
      args[i].check(arguments[i]);
    }
    // If nothing threw an exception, we are free to run the function
    var retVal = fn.apply(this, arguments);
  
    // check the return value
    if ( args.returnValue ) {
      args.returnValue.check(retVal);
    }
    
    return retVal;
  }
  // keep the old value of toString (hide the decorator)
  ret.toString = function() { return fn.toString(); }
  return ret;
}




