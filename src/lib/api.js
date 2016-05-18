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



var fs = require('fs');
require('../core/foam');

function mapType(typeStr, obj) {
  if ( ! typeStr ) return;
  if ( typeStr === 'integer' ) return "Int";
  if ( typeStr === 'number' ) {
    return foam.String.capitalize(obj.format);
  } else if ( typeStr === 'string' && obj.enum ) {
    return 'Enum';
  }
  return foam.String.capitalize(typeStr);
}

function getProps(schema, pkg) {
  var ret = [];
  for ( var name in schema.properties ) {
    var prop = schema.properties[name];
    var p = {
      class: mapType(prop.type, prop),
      name: name
    };
    if ( p.class == 'Enum' ) {
      p.of = pkg+'.'+'ENUM_'+name;
      
      foam.ENUM({
        package: pkg,
        name: 'ENUM_'+name,

        values: (function() {
          var ret = [];
          for ( var i = 0; i < prop.enum.length; i++ ) {
            ret.push({ name: prop.enum[i] }); //TODO: enumdescription
          }
          return ret;
        })(),
      });  
    } else if ( p.class == 'Array' ) {
      if ( prop.items.$ref ) {
        // class
        p.class = "FObjectArray";
        p.of = pkg + '.' + prop.items.$ref;
      } else {
        if ( prop.items.type == 'string' ) {
          p.class = "StringArray";
        } else {
          delete p.class;
          p.of = 'array';
          p.factory = function() { return []; }
        }
      }
    }

    ret.push(p);
  }
  return ret;
}

global.apiToModels = function apiToModels(api) {
  var schemas = api.schemas;
  var pkg = 'api.'+api.name;
  
  for ( var name in schemas ) {
    var schema = schemas[name];
    var newModel = {
      package: pkg,
      name: name,
      label: schema.description,
      properties: getProps(schema, pkg),
    }
    foam.CLASS(newModel);
  }
}
