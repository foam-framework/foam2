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

/* global window */
/* jshint evil: true */
require('../../../foam');
require('./OAuth2');
require('./ProtobufParser');
var fs = require('fs');
var path = require('path');
/* globals process */

// Usage: node this-file [--whitelist foo,bar,baz] outfile protofiles...
var parser = foam.lookup('com.google.net.ProtobufParser').create();

var whitelist = null;
var outIndex = 2;
if ( process.argv[2] === '--whitelist' ) {
  outIndex = 4;
  whitelist = process.argv[3].split(',');
}

// Expects the input filename to be on the command line.
var outfile = process.argv[outIndex];

console.log('whitelist = ' + whitelist);

var files = {};
for ( var i = outIndex + 1 ; i < process.argv.length ; i++ ) {
  if ( process.argv[i].endsWith('.proto') ) {
    console.log(process.argv[i]);
    files[process.argv[i]] =
        parser.parseString(fs.readFileSync(process.argv[i]).toString());
  }
}

// TODO(braden): Oneof is not handled by the generated methods.

var url = require('url');

function mapType(typeStr, obj) {
  if ( ! typeStr ) return;
  if ( typeStr === 'integer' ) return 'Int';
  if ( typeStr === 'int64' ) return 'Int';
  if ( typeStr === 'int32' ) return 'Int';
  if ( typeStr === 'uint64' ) return 'Int';
  if ( typeStr === 'uint32' ) return 'Int';
  if ( typeStr === 'sint64' ) return 'Int';
  if ( typeStr === 'sint32' ) return 'Int';
  if ( typeStr === 'bytes' ) return 'String';
  if ( typeStr === 'bool' ) return 'Boolean';
  if ( typeStr === 'number' ) {
    return foam.String.capitalize(obj.format);
  } else if ( typeStr === 'string' && obj.enum ) {
    return 'Enum';
  }

  if ( foam.Object.isInstance(typeStr) ) {
    return 'Int';
  }

  if ( typeStr.indexOf('.') > -1 ) {
    return typeStr;
  }

  return foam.String.capitalize(typeStr);
}

function reverseMapType(property) {
  if ( foam.core.Int.isInstance(property) ) return 'number';
  if ( foam.core.Float.isInstance(property) ) return 'number';
  if ( foam.core.Long.isInstance(property) ) return 'number';
  if ( foam.core.Double.isInstance(property) ) return 'number';
  if ( foam.core.String.isInstance(property) ) return 'string';
  if ( foam.core.Boolean.isInstance(property) ) return 'bool';

  if ( property.of ) return property.of;

  return 'any';
}

// Properties and Method arguments are typed things
function getTypedThing(name, prop, pkg, parent) {
  var p = {
    class: mapType(prop.type, prop),
    name: name
  };

  var ofName = pkg + '.' + prop.type;
  if ( parent.subMessages && parent.subMessages.length ) {
    for ( var i = 0; i < parent.subMessages.length; i++ ) {
      if ( parent.subMessages[i].name === prop.type ) {
        ofName = pkg + '.' + parent.name + '.' + prop.type;
        break;
      }
    }
  }

  // detect class references
  if ( p.class === prop.type ) {
    // no capitalization required, therefore this was already a class name
    p.class = 'foam.core.FObjectProperty';
    p.of = ofName;
    p.toJSON = function(value) {
      return value.toJSON ? value.toJSON() : value;
    };
  }

  // TODO: plain array for primitive repeats?
  if ( prop.repeated ) {
    p.class = 'foam.core.FObjectArray';
    p.of = ofName;
    p.toJSON = function(value) {
      return value.map(function(x) { return x.toJSON ? x.toJSON() : x; });
    };
  }
  return p;
}

function camelize(name) {
  // Converts eg. underscore_names to underscoreNames.
  var ret = name.replace(/(?:[-\s_])(\w)/g, function(_, a) {
    return a ? a.toUpperCase() : '';
  });
  return ret[0].toLowerCase() + ret.substring(1);
}

function processFields(model, message, pkg) {
  if ( ! message.fields ) return;

  for ( var i = 0; i < message.fields.length; i++ ) {
    var prop = message.fields[i];
    var name = prop.name;
    var camelName = camelize(name);
    var capName = foam.String.capitalize(camelName);
    var p = getTypedThing(camelName, prop, pkg, message);

    // TODO: plain arrays for primitive repeats?
    if ( p.class === 'foam.core.FObjectArray' ) {
      p.factory = function() { return []; };
      model.methods.push({
        name: 'get' + capName + 'List',
        code: eval('(function() { return this.' + camelName + '; })')
      });
      model.methods.push({
        name: 'set' + capName + 'List',
        code: eval('(function(x) { this.' + camelName + ' = x; })')
      });
      model.methods.push({
        name: 'add' + capName,
        code: eval('(function(x) { this.' + camelName + '.push(x); })')
      });
      model.methods.push({
        name: 'clear' + capName + 'List',
        code: eval('(function() { this.' + camelName + ' = []; })')
      });
    } else {
      // Basic property, just get and set.
      model.methods.push({
        name: 'get' + capName,
        code: eval('(function() { return this.' + camelName + '; })')
      });
      model.methods.push({
        name: 'set' + capName,
        code: eval('(function(x) { this.' + camelName + ' = x; })')
      });
    }

    model.properties.push(p);
  }
}

function getServiceMethods(service, pkg) {
  var ret = [];
  if ( ! service.rpcs ) return ret;

  // TODO: refactor into smaller chunks
  function generateRPC(requestType, responseType, options) {
    var method =
      options.value.get ? 'GET' :
      options.value.post? 'POST':
      options.value.delete ? 'DELETE':
      options.value.put ? 'PUT':
      options.value.patch ? 'PATCH' : 'CUSTOM';
    var path =
      options.value.get ||
      options.value.post ||
      options.value.delete ||
      options.value.put ||
      options.value.patch ||
      options.value.custom;

    // in build mode, add fields to the body instead of the query params
    var bodyBuilderMode = ( options.value.body === '*' );
    var bodyKey = bodyBuilderMode ? undefined : options.value.body;

    var reqType = foam.lookup(requestType);
    var reqProps = reqType.getAxiomsByClass(foam.core.Property);

    var respType = foam.lookup(responseType);

    // identify parameter names
    var fieldNames = Object.create(null);
    var repeatedNames = Object.create(null);
    reqProps.forEach(function(prop) {
      if ( foam.core.FObjectProperty.isInstance(prop) ) {
        // A sub-message?
        var subType = foam.lookup(prop.of);
        subType.getAxiomsByClass(foam.core.Property).forEach(function(subProp) {
          // if a model type, but not an Enum, don't include it, since we
          // can't use it for path/{replacement}/ or query params
          if ( foam.core.FObjectProperty.isInstance(subProp)
              || foam.core.FObjectArray.isInstance(subProp) ) {
            var subSubType = foam.lookup(subProp.of, true);
            if ( subSubType &&
                 ! foam.core.EnumModel.isInstance(subSubType.model_) ) {
              return;
            }
          }
          // Field name becomes "thing.subField"
          fieldNames[prop.name + '.' + subProp.name] = subProp;
        });
      } else if ( foam.core.FObjectArray.isInstance(prop) ) { // TODO: plain array?
        // Can't use a repeated field in the path
        repeatedNames[prop.name] = prop;
      } else {
        // TODO: assert prop is be a primitive type
        fieldNames[prop.name] = prop;
      }
    });

    // Remove bodyKey from fieldNames, if set, since it is used
    // as the body content, never a query parameter
    if ( bodyKey ) {
      // assert !repeatedNames[bodyKey];
      delete fieldNames[bodyKey];
    }


    // Call req(name) when outputting field names into the output function
    var req = function toRequestParamName(fieldName) {
      // this is for outputting a function that takes
      // a request object as its single argument. Each
      // field is accessed as a property of the req object:
      return 'req.' + fieldName;
    };

    // scan path to find path parameters
    var pathFieldNames = [];
    var matches;
    var pathRE = /\{(.*?)\}/g;
    var pathOutput = path ? '\'' + path + '\'' : '\'\'';
    pathOutput = pathOutput.replace(pathRE, function(match, p_name) {
      var pname = foam.String.camelize(p_name);
      if ( fieldNames[pname] ) {
        // move name to path names list
        pathFieldNames.push(pname);
        delete fieldNames[pname];
      } else {
        if ( repeatedNames[pname] ) {
          throw "proto_gen: Can't use repeated field in path: " + pname;
        }
        throw "proto_gen: Undefined field \"" + pname + "\" in path: " +
          path + " -- Request: " + reqType.toString() + "[" + reqProps + "]";
      }
      // replace the {name} with code output ' + req.name + '
      return '\' + ' + req(pname) + '.toString() + \'';
    });
    var indent = '        ';
    // create url and body builder code
    // TODO: generalize this
    var urlBuilder = indent + 'var path = this.mobilesdkBaseUrl + ' + pathOutput + ';\n';
    var bodyBuilder = '';
    var paramsBuilder = '';

    // Add query params. Primitive fields and repeated fields are valid.
    if ( ! bodyBuilderMode ) {
      paramsBuilder = indent + 'var params = {\n';

      // output each field as a query param
      for ( var fname in fieldNames ) {
        paramsBuilder += indent + '  \"' + fname + '\": ' + req(fname) + '.toString(),\n';
      }
      // output each array, gapi.client.request params arg will handle it
      for ( var fname in repeatedNames ) {
        paramsBuilder += indent + '  \"' + fname + '\": ' + req(fname) + '.toString(),\n';
      }
      paramsBuilder += indent + '};\n';

      // assign body if required
      if ( bodyKey ) {
        // TODO: outputter to stringify this object
        bodyBuilder = indent + 'var body = ' + req(bodyKey) + ';\n';
      }
      // else bodyBuilder empty
    } else {
      // Build the body content from the remaining fields

      // Since we have a request object with all the fields in it,
      // remove the ones we used already and pass it along.
      bodyBuilder = indent + 'var body = { __proto__: req,\n';
      pathFieldNames.forEach(function(pname) {
        bodyBuilder += indent + '  ' + pname + ': undefined,\n';
      });
      bodyBuilder += indent + '};\n';
      bodyBuilder += indent + 'body = this.OUTPUTTER.stringify(body);\n';
    }
    urlBuilder += '\n';

    // create the generated rpc function
    var fstr = 'function(req) {\n' +
          urlBuilder +
          bodyBuilder +
          paramsBuilder +
          // TODO: generalize this
          indent + 'return this.mobilesdkBackendService.sendGapiRequest({\n' +
          indent + '  method: \'' + method + '\',\n' +
          indent + '  path: path,\n' +
          (bodyBuilder ? indent + '  body: body,\n' : '') +
          (paramsBuilder ? indent + '  params: params,\n' : '') +
          indent + '});\n' +
          '      }\n';
    var f = function() {};
    f.toString = function() {
      return fstr;
    };
    return f;
  };

  var pkgPrefix = pkg ? pkg + '.' : '';
  for ( var i = 0; i < service.rpcs.length; i++ ) {
    var m = service.rpcs[i];

    // add current package if no package specified on request/response types
    var reqType = m.requestType.indexOf('.') < 0 ?
      pkgPrefix + m.requestType : m.requestType;
    var respType = m.responseType.indexOf('.') < 0 ?
      pkgPrefix + m.responseType : m.responseType;

    for ( var j = 0; j < m.options.length; j++ ) {
      if ( m.options[j].name === 'google.api.http' ) {
        ret.push({
          name: m.name,
          code: generateRPC(reqType, respType, m.options[j])
        });
      }
    }
  }
  return ret;
}

function getServiceMappings(service, pkg) {
  var ret = {
    REQUEST_TYPES: {},
    RESPONSE_TYPES: {}
  };

  if ( ! service.rpcs ) return ret;

  var pkgPrefix = pkg ? pkg + '.' : '';
  for ( var i = 0; i < service.rpcs.length; i++ ) {
    var m = service.rpcs[i];

    var reqType = m.requestType.indexOf('.') < 0 ?
      pkgPrefix + m.requestType : m.requestType;
    var respType = m.responseType.indexOf('.') < 0 ?
      pkgPrefix + m.responseType : m.responseType;

    for ( var j = 0; j < m.options.length; j++ ) {
      ret.REQUEST_TYPES[m.name] = reqType;
      ret.RESPONSE_TYPES[m.name] = respType;
    }
  }
  return ret;
}

function outputModel(pkg, name) {
  var id = pkg + '.' + name;
  if ( ! checkWhitelist(id) ) return;

  var m = foam.lookup(id);

  pkg = pkg.replace(/\./g, '/');

  var o =
    '/**\n' +
    ' * @license\n' +
    ' * Copyright 2016 Google Inc. All Rights Reserved.\n' +
    ' */\n\n';

  foam.json.Pretty.outputDefaultValues = false;

  o += ( foam.core.EnumModel.isInstance(m.model_) ) ? 'window.foam.ENUM(' : 'window.foam.CLASS(';
  o += foam.json.Pretty.stringify(m.model_);
  o += ');\n\n';

  fs.appendFileSync(outfile, o);
}

function outputServiceExporter(services, pkg, baseUrl) {
  // TODO: services as singletons, eliminate this exporter


  // Need to force the service exporter onto the whitelist, if one exists.
  if ( whitelist ) {
    whitelist.push('serviceExporters');
  }

  var u = baseUrl;

  var requires = [];
  var exports = [];
  var imports = [];
  var properties = [];

  // TODO: generalize this
  properties.push({ name: 'mobilesdkBackendService' });
  exports.push('mobilesdkBackendService');
  properties.push({ name: 'mobilesdkBaseUrl' });
  exports.push('mobilesdkBaseUrl');

  services.forEach(function(service) {
    var servPropName = service.package.replace(/\./g,'_') + '_' + service.name;
    exports.push(servPropName);
    requires.push(service.package + '.' + service.name + ' as Service_' +
        service.name);
    properties.push({
      name: servPropName,
      factory: Function('{ return this.Service_' + service.name +
          '.create(); }')
    });
  });

  var m = {
    name: 'ExportAllServices',
    package: pkg,
    requires: requires,
    exports: exports,
    properties: properties
  };
  foam.CLASS(m);

  outputModel(pkg, 'ExportAllServices');

}

function getServiceProperties(service, pkg) {
  return [
    {
      name: 'OUTPUTTER',
      factory: function() {
        return {
          __proto__: window.foam.json.Strict,
          outputDefaultValues: false,
          outputClassNames: false
        };
      }
    }
  ];
}

function readService(pkg, service, services) {
  var newModel = {
    package: pkg,
    name: service.name,
    // TODO: generalize this
    imports: [ 'mobilesdkBaseUrl', 'mobilesdkBackendService' ],
    methods: getServiceMethods(service, pkg),
    constants: getServiceMappings(service, pkg),
    properties: getServiceProperties(service, pkg)
  };

  foam.CLASS(newModel);
  outputModel(pkg, service.name);
  services.push({ package: pkg, name: service.name });
}


function apiToModels(proto) {
  var services = [];
  // pass one loads models
  for ( var file in proto ) {
    var pkg = '';
    for ( var i = 0; i < proto[file].length; i++ ) {
      var p = proto[file][i];
      // ignore arrays and null
      if ( foam.Object.isInstance(p) && p !== null ) {
        if ( p.node === 'package' ) {
          pkg = pkg || p.value;
        } else {
          readBlockMessagesOnly(pkg, p, services);
        }
      }
    }
  }

  // pass two loads services
  for ( var file in proto ) {
    var pkg = '';
    for ( var i = 0; i < proto[file].length; i++ ) {
      var p = proto[file][i];
      // ignore arrays and null
      if ( foam.Object.isInstance(p) && p !== null ) {
        if ( p.node === 'package' ) {
          pkg = pkg || p.value;
        } else {
          readBlockNotMessage(pkg, p, services);
        }
      }
    }
  }

  // TODO: generalize this
  outputServiceExporter(services, 'serviceExporters',
      url.parse('https://test-mobilesdk-pa.sandbox.googleapis.com'));
}

function readBlockNotMessage(pkg, ast, services) {
  switch ( ast.node ) {
    case 'service':
      readService(pkg, ast, services);
      break;
    default:
      break;
  }
}

function readBlockMessagesOnly(pkg, ast, services) {
  switch ( ast.node ) {
    case 'message':
      readMessage(pkg, ast);
      break;
    case 'enum':
      readEnum(pkg, ast);
      break;
    default:
      break;
  }
}

function readMessage(pkg, message) {
  var name = message.name;
  var newModel = buildMessage(pkg, message);
  newModel.package = pkg;
  console.log('buildMessage', pkg, message.name);
  foam.CLASS(newModel);
  outputModel(pkg, name);
}

// Returns a raw JSON object describing a message. No package is set, and it's
// suitable for being added to the inner classes:[] list.
function buildMessage(pkg, message) {
  console.log('buildMessage', pkg, message.name);
  var newModel = {
    name: message.name,
    label: message.name,
    properties: [],
    methods: [
      function serialize() {
        var json = window.foam.json.Network.objectify(this);
        // TODO(braden): Replace dropClass_ with the outputClass option.
        this.dropClass_(json);
        return json;
      },
      function dropClass_(obj) {
        if ( Array.isArray(obj) ) {
          obj.forEach(this.dropClass_.bind(this));
        } else if ( typeof obj === 'object' ) {
          delete obj.class;
          window.foam.Object.forEach(obj, this.dropClass_.bind(this));
        }
      }
    ]
  };
  processFields(newModel, message, pkg);

  // Collect any nested entities.
  // Can be nested messages or enums (or options, which we're ignoring).
  if ( message.subMessages && message.subMessages.length ) {
    for ( var i = 0; i < message.subMessages.length; i++ ) {
      var m = message.subMessages[i];
      if ( m.node === 'message' ) {
        readMessage(pkg + '.' + message.name, m);
      } else if ( m.node === 'enum' ) {
        readEnum(pkg + '.' + message.name, m);
      }
    }
  }

  return newModel;
}

// Top-level enums only.
function readEnum(pkg, enuma) {
  var e = buildEnum(enuma);
  e.package = pkg;
  foam.ENUM(e);
  outputModel(pkg, enuma.name);
}

// Top-level or nested enums.
function buildEnum(enuma) {
  var enumName = enuma.name;

  return {
    class: 'foam.core.EnumModel',
    name: enumName,
    values: (function() {
      var ret = [];
      for ( var j = 0 ; j < enuma.fields.length ; j++ ) {
        var field = enuma.fields[j];
        if ( ! field.node && field.node === 'enumField' ) continue;
        ret.push({
          name: field.key,
          ordinal: field.value,
          values: {
            label: field.key,
            outputJSON: function(o) {
              o.out('{ label: \'' + this.label + '\' }');
            }
          }
        });  // TODO: enumdescription
      }
      return ret;
    })(),
    methods: [
      function toJSON() {
        return this.name;
      }
    ]
  };
}

function checkWhitelist(id) {
  if ( ! whitelist ) return true;

  for ( var i = 0; i < whitelist.length; i++ ) {
    if ( id.startsWith(whitelist[i]) ) return true;
  }
  return false;
}

apiToModels(files);

