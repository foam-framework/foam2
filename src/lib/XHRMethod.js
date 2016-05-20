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

/** A method that is configured to call a service over HTTP. No code or
  function body is required here, as the actual body is generated to call
  the remote service. This will always return a promise that supplies the
  return value of the service call.
  <p>Overriding by an XHRMethod is not supported. You can override an
  XHRMethod with a normal one.
  <p>FUTURE: Generalize. */
foam.CLASS({
  package: 'foam.api',
  name: 'XHRMethod',
  extends: 'foam.core.Method',
  requires: [
    'foam.api.XHRArgument',
  ],

  properties: [
    {
      /** The path prefix. Parameters may add to the path */
      name: 'path'
    },
    {
      name: 'httpMethod',
      value: 'GET',
      postSet: function(old,nu) {
        this.baseOpts_ && ( this.baseOpts_.method = nu );
      }
    },
    {
      /** The parameters to call with, in order */
      class: 'FObjectArray',
      name: 'parameters',
      of: 'foam.api.XHRArgument',
    },
    {
      /** XHRMethods will always return a Promise, but the Promise will pass
        along a parameter of the type specified here. */
      name: 'returns',
    },
    { name: 'http', factory: function() { return require('http') } },
    { name: 'https', factory: function() { return require('https') } },
    { name: 'url',  factory: function() { return require('url') } },
    {
      /** cache of http options */
      name: 'baseOpts_',
      postSet: function(old,nu) {
        nu.method = this.httpMethod;
      }
    },
  ],

  methods: [
    function installInProto(p) {
      // generate body to call through to xhr
      var axiom = this;

      // set up function with correct args, pass them into the
      // actual implementation, callRemote_()
      // ALTERNATE: just pass args in and read from arguments
      var code = "(function "+axiom.name+"_"+"(";
      var names = this.parameters.map(axiom.XHRArgument.NAME.f);
      code += names.join(', ');
      code += ') {\n';
      code += 'var opt_args = {\n';
      names.forEach(function(name) {
        code += '  '+name+': '+name+',\n';
      });
      code += '};\n';
      code += 'return axiom.callRemote_(opt_args, this);\n';
      code += '})';

      code = eval(code);
      
      p[axiom.name] = code;
    },

    function callRemote_(/* object */ opt_args, host /* Promise */) {
      // 'this' is the axiom instance
      var self = this;
      return new Promise(function(resolve, reject) {
        if ( self.http ) {
          self.callRemote_node_(opt_args, host, resolve, reject);
        } else {
          // browser
          // TODO: impl for browser XHR
          reject(new Error('Browser support not available'));
        }
      });
    },

    function callRemote_node_(opt_args, host, resolve, reject) {
      var self = this;
      var opt = this.buildUrlOptions_node_(opt_args, host);

      var body = "";
      var req = ( opt.protocol == 'http:' ? self.http : self.https ).request(opt, function(response) {
        console.log('STATUS: ', response.statusCode);
        response.setEncoding('utf8');
        response.on('data', function(chunk) {
          body += chunk;
        });
        response.on('end', function() {
          if ( response.statusCode >= 300 ) {
            reject(new Error(self.name + " invalid XHRMethod http response: " + response.statusCode + ":" + body));
            return;
          }
          body = JSON.parse(body);
          // handle response
          self.response_(body, host, resolve, reject);
        });
      });
      req.end();
    },

    function buildUrlOptions_node_(opt_args, host) {
      var opts = this.baseOpts_ || ( this.baseOpts_ = { path: this.path } );

      // work with a 'copy'
      opts = Object.create(opts);
      // fill in the server to target from the instance hosting this property
      opts.hostname = host.xhrHostName;
      opts.port = host.xhrPort;
      opts.protocol = host.xhrProtocol;

      var path = host.xhrBasePath + opts.path;
      var query = "";

      // add on parameters passed as part of the path or query
      this.parameters.forEach(function(param) {
        var val = opt_args[param.name].toString();
        // put the dot back if we removed one from the name
        var pname = param.name.replace('__dot__','.');
        if ( param.location === 'path' ) {
          // find the placeholder and replace it
          path = path.replace("{"+pname+"}", val);
        } else if ( param.location === 'query' ) {
          query += "&" + pname + "=" + val;
        }
      });
      opts.path = path + ( query ? "?" + query.substring(1) : "" );

      return opts;
    },

    function response_(json, host, resolve, reject) {
      if ( ! this.returns ) {
        resolve();
        return;
      }
      if ( this.returns.type ) {
        // a modelled return type
        resolve(this.returns.type.create(json, host));
        return;
      }
      resolve(foam.json.parse(json));
      return;
    }
  ]

});

foam.CLASS({
  package: 'foam.api',
  name: 'XHRArgument',
  extends: 'foam.core.Argument',
  properties: [
    {
      /** The location to put this value in the request: 'query' or 'path' */
      name: 'location',
      value: 'query',
    },
    // optional
  ],
 });
