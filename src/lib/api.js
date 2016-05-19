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



require('../core/foam');
require('./XHRMethod');

var fs = require('fs');
var http = require('http');
var https = require('https');
var url = require('url');

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
      outputModel(pkg, 'ENUM_'+name);

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

function getMethods(res, pkg, basePath) {
  var ret = [];
  for ( var name in res.methods ) {
    var m = res.methods[name];
    var method = {
      name: name,
      path: basePath + m.path,
      httpMethod: m.httpMethod,
    };
    if ( m.response && m.response.$ref ) {
      method.returns = foam.core.ReturnValue.create({
        typeName: pkg + '.' + m.response.$ref
      });
    }

    //TODO: respect m.parameterOrder []
    method.parameters = [];
    for ( var paramName in m.parameters ) {
      var p = m.parameters[paramName];
      var param = {
        name: paramName.replace('.', '_$_dot_$_'),
        typeName: 'any', // TODO: type
        location: p.location,
      }
      method.parameters.push(param);
    }

    ret.push(foam.api.XHRMethod.create(method));
  }
  return ret;
}

function outputModel(pkg, name) {

  var m = foam.lookup(pkg+'.'+name);

  pkg = pkg.replace('.', '/');

  var o =
    "/*\n"+
    " * @license\n"+
    " * Copyright 2016 Google Inc. All Rights Reserved.\n"+
    " *\n"+
    " * Licensed under the Apache License, Version 2.0 (the \"License\");\n"+
    " * you may not use this file except in compliance with the License.\n"+
    " * You may obtain a copy of the License at\n"+
    " *\n"+
    " *     http://www.apache.org/licenses/LICENSE-2.0\n"+
    " *\n"+
    " * Unless required by applicable law or agreed to in writing, software\n"+
    " * distributed under the License is distributed on an \"AS IS\" BASIS,\n"+
    " * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n"+
    " * See the License for the specific language governing permissions and\n"+
    " * limitations under the License.\n"+
    " */\n\n";

  foam.json.Pretty.outputDefaultValues = false;

  o += foam.json.Pretty.stringify(m.model_);

  // why do I have to do this manually :(
  var pparts = pkg.split('/');
  var p = '.';
  pparts.forEach(function(part) {
    try {
      p += '/'+part;
      fs.mkdirSync(p);
    } catch(e) {}
  })

  fs.writeFile('./'+pkg+'/'+name+'.js', o);
}

function apiToModels(api) {
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

    outputModel(pkg, name);
  }

  var resources = api.resources;

  for ( var name in resources ) {
    var resource = resources[name];
    var newModel = {
      package: pkg,
      name: name,

      properties: [ 'xhrHostName', 'xhrPort', 'xhrProtocol' ],

      methods: getMethods(resource, pkg, api.servicePath),
    }
    foam.CLASS(newModel);

    outputModel(pkg, name);
  }


}

function loadFile(filename) {
  var f = fs.readFileSync(filename).toString();
  f = JSON.parse(f);
  apiToModels(f);
}

function loadRequest(uri) {

  var opt = url.parse(uri);
  opt.method = 'GET';

  var body = "";
  var req = ( opt.protocol == 'http' ? http : https ).request(opt, function(response) {
    console.log('STATUS: ', response.statusCode);
    response.setEncoding('utf8');
    response.on('data', function(chunk) {
      body += chunk;
    });
    response.on('end', function() {
      if ( response.status >= 300 ) console.log('body: '+body);
      body = JSON.parse(body);
      apiToModels(body);
      console.log('Done.');
    })
  });
  req.end();

}


(function scanArgs(args) {
  for ( var i = 0; i < args.length; i++ ) {
    var arg = args[i];
    if ( ( arg == '-g' || arg == '--get' ) && args[i+1] ) {
      loadRequest(args[i+1]);
      return;
    } else if ( ( arg == '-f' || arg == '--file' ) && args[i+1] ) {
      loadFile(args[i+1]);
      return;
    }
  }

  console.error("Bad arguments.\nUsage:\n"+
    "\t-g --get URL  : get JSON from a url\n"+
    "\t-f --file PATH: load JSON from a file\n");
})(process.argv);




