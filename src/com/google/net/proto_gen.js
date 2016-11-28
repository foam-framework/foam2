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
require('./ProtobufParser');
var fs = require('fs');
var path = require('path');
/* globals process */

// Usage: output file is argv[2], input .proto files in argv[3+].
var parser = foam.lookup('com.google.net.ProtobufParser').create();

// Expects the input filename to be on the command line.
var outfile = process.argv[2];

var files = {};
for ( var i = 3 ; i < process.argv.length ; i++ ) {
  if ( process.argv[i].endsWith('.proto') ) {
    console.log(process.argv[i]);
    files[process.argv[i]] =
        parser.parseString(fs.readFileSync(process.argv[i]).toString());
  }
}

// TODO(braden): Oneof is not handled by the generated methods.

// TODO(braden): Request objects provide parameters to the GET request, so need
// to unpack those to get types for the HTTPMethod to generate:
// - RequestObj.proj_id > provides proj_id to > /v1/project/{proj_id}:byId
// - gen.ListProjects(PType proj_id) gets PType from RequestObj, otherwise
//     passes the parameter into the path as normal at runtime.





require('../../../lib/HTTPMethod');

var http = require('http');
var https = require('https');
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

function getServiceMethods(service) {
  var ret = [];
  if ( ! service.rpcs ) return ret;

  function getFactory(path) {
    var f = function() {};
    f.toString = function() {
      return 'function() {\n' +
          '  return this.mobilesdkBackendService.sendGapiRequest({\n' +
          '    method: \'GET\',\n' +
          '    path: this.mobilesdkBaseUrl + \'' +
                  path + '\'\n' +
          '  });\n' +
          '}\n';
    };
    return f;
  }

  function postFactory(path) {
    var f = function() {};
    f.toString = function() {
      return 'function(body) {\n' +
          '  return this.mobilesdkBackendService.sendGapiRequest({\n' +
          '    method: \'POST\',\n' +
          '    path: this.mobilesdkBaseUrl + \'' +
                  path + '\',\n' +
          '    body: body\n' +
          '  });\n' +
          '}\n';
    };
    return f;
  }

  for ( var i = 0; i < service.rpcs.length; i++ ) {
    var m = service.rpcs[i];

    for ( var j = 0; j < m.options.length; j++ ) {
      if ( m.options[j].name === 'google.api.http' ) {
        if ( m.options[j].value.get ) {
          ret.push({
            name: m.name,
            code: getFactory(m.options[j].value.get)
          });
        } else if ( m.options[j].value.post ) {
          ret.push({
            name: m.name,
            code: postFactory(m.options[j].value.post)
          });
        }
      }
    }
  }
  return ret;
}

function outputModel(pkg, name) {
  var m = foam.lookup(pkg + '.' + name);

  pkg = pkg.replace(/\./g, '/');

  var o =
    '/**\n' +
    ' * @license\n' +
    ' * Copyright 2016 Google Inc. All Rights Reserved.\n' +
    ' */\n\n';

  foam.json.Pretty.outputDefaultValues = false;

  o += '(function() { var c = window.foam.json.parse(';
  o += foam.json.Pretty.stringify(m.model_);
  o += ').buildClass(); window.foam.register(c); ' +
      'window.foam.package.registerClass(c); })();\n\n';

  fs.appendFileSync(outfile, o);
}

function outputServiceExporter(services, pkg, baseUrl) {
  var u = baseUrl;

  var requires = [];
  var exports = [];
  var imports = [];
  var properties = [
    {
      name: 'hostname',
      value: u.hostname
    },
    {
      name: 'path',
      value: u.path
    },
    {
      name: 'port',
      value: u.port
    },
    {
      name: 'protocol',
      value: u.protocol
    },
    {
      name: 'headers'
    },
    {
      name: 'responseType',
      value: 'json'
    },
    'oauth2ClientId',
    'oauth2CookiePolicy',
    'oauth2Scopes',
    {
      class: 'Class',
      name: 'requestClass',
      factory: function() { return this.GoogleOAuth2XHRHTTPRequest; }
    }
  ];

  // http request factory
  requires.push('foam.net.GoogleOAuth2XHRHTTPRequest');
  exports.push('HTTPRequestFactory');
  properties.push({
    name: 'HTTPRequestFactory',
    factory: function() {
      var self = this;
      return function(opt_args, opt_X) {
        // TODO: locked into one kind of auth.
        var ret = self.requestClass.create({
          hostname: self.hostname,
          path: self.path,
          port: self.port,
          protocol: self.protocol,
          headers: self.headers,
          responseType: self.responseType,

          clientId: self.oauth2ClientId,
          cookiePolicy: self.oauth2CookiePolicy,
          scopes: self.oauth2Scopes
        }, opt_X);
        if ( opt_args ) ret.copyFrom(opt_args);
        return ret;
      };
    }
  });

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

function readService(pkg, service, services) {
  var newModel = {
    package: pkg,
    name: service.name,
    imports: [ 'mobilesdkBaseUrl', 'mobilesdkBackendService' ],
    methods: getServiceMethods(service)
  };

  foam.CLASS(newModel);
  outputModel(pkg, service.name);
  services.push({ package: pkg, name: service.name });
}


function apiToModels(proto) {
  var services = [];
  for ( var file in proto ) {
    var pkg = '';
    for ( var i = 0; i < proto[file].length; i++ ) {
      var p = proto[file][i];
      // ignore arrays and null
      if ( foam.Object.isInstance(p) && p !== null ) {
        if ( p.node === 'package' ) {
          pkg = pkg || p.value;
        } else {
          readBlock(pkg, p, services);
        }
      }
    }
  }

  outputServiceExporter(services, 'serviceExporters',
      url.parse('https://test-mobilesdk-pa.sandbox.googleapis.com'));
}

function readBlock(pkg, ast, services) {
  switch ( ast.node ) {
    case 'message':
      readMessage(pkg, ast);
      break;
    case 'service':
      readService(pkg, ast, services);
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


fs.appendFileSync(outfile, 'goog.provide("proto.gen");\n\n' +
    'var __foam_loaded = false;\n' +
    'function prepareFOAM() {\n' +
    'if (__foam_loaded) return;\n' +
    '__foam_loaded = true;\n')
apiToModels(files);
fs.appendFileSync(outfile, '\n}\n');

