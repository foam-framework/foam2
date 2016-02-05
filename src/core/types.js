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


CLASS({
  name: 'Argument',
  properties: [
    { name: 'name' },
    { name: 'typeName' },
    { name: 'type' },
    { name: 'optional', defaultValue: false }
  ]
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
    var typeMatch = arg.match(/^\s*(\/\*\s*([\w\.]+)(\?)?\s*\*\/)?\s*(\w+)\s*(\/\*\s*([\w\.]+)\s*\*\/)?/);
    if ( typeMatch ) {
      ret.push(/*X.*/Argument.create({
        name: typeMatch[4],
        typeName: typeMatch[2],
        type: global[typeMatch[2]],
        optional: typeMatch[3] == '?'
      }));
      // TODO: this is only valid on the last arg
      if ( typeMatch[6] ) ret.returnType = typeMatch[6];
    } else {
      throw "foam.types.getFunctionArgs argument parsing error: " + typeMatch.toString();
    } 
  });

  return ret;
}






