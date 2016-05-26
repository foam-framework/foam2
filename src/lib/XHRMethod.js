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
  package: 'foam.net',
  name: 'XHRMethod',
  extends: 'foam.core.Method',
  requires: [
    'foam.net.XHRArgument',
    'foam.core.Imports',
  ],
  imports: [
    'assert',
  ],

  properties: [
    {
      /** The path prefix. Parameters may add to the path */
      name: 'path'
    },
    {
      name: 'httpMethod',
      value: 'GET',
    },
    {
      /** The args to call with, in order */
      class: 'FObjectArray',
      name: 'args',
      of: 'foam.net.XHRArgument',
      factory: function() { return []; }
    },
    {
      /** XHRMethods will always return a Promise, but the Promise will pass
        along a parameter of the type specified here. */
      name: 'returns',
    },
    {
      /** the name of the XHR service to import at run time */
      name: 'xhrServiceName',
      value: 'XHRService'
    }
  ],

  methods: [
    function installInClass(c) {
      // add an import for the XHRService on our host class

      // May have many XHRMethods in a host class, but only do service import once.
      var existing = c.getAxiomByName(this.xhrServiceName);
      this.assert( ( ! existing ) || this.Imports.isInstance(existing),
        "XHRMethod installInClass found conflicting axiom", existing && existing.name, ".",
        "Use a different XMRMethod.xhrServiceName.");

      if ( ! existing ) {
        c.installAxiom(this.Imports.create({
          name: this.xhrServiceName,
          key: this.xhrServiceName
        }));
      }
    },

    function installInProto(p) {
      // generate body to call through to xhr
      var axiom = this;

      // set up function with correct args, pass them into the
      // actual implementation, callRemote_()
      // ALTERNATE: just pass args in and read from arguments
      var code = "(function "+axiom.name+"_"+"(";
      var names = this.args.map(axiom.XHRArgument.NAME.f);
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
      this.assert( host[this.xhrServiceName], "XHRMethod call can't find XHR service import ", this.xhrServiceName, "on", host);

      // 'this' is the axiom instance
      var self = this;
      var path = this.path;
      var query = "";

      // TODO: request body... always the first arg, if present?

      // add on args passed as part of the path or query
      self.args.forEach(function(param) {
        if ( ! opt_args[param.name] ) return;
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
      path = path + ( query ? "?" + query.substring(1) : "" );
      var request = host[this.xhrServiceName].create();
      request.path += "/" + path;
      request.method = self.httpMethod;

      return request.send().then(function(response) {
        self.assert(response.responseType === 'json', "XHRMethod given a request not configured to return JSON", request);
        return response.payload.then(function(json) {
          if ( ! self.returns ) {
            // no return
            return;
          }
          if ( ! self.returns.type ) {
            self.returns.type = foam.lookup(self.returns.typeName, true);
          }
          if ( self.returns.type ) {
            // a modelled return type
            return self.returns.type.create(json, host);
          }
          // else return raw json
          return json;
        });
      });
    },

  ]

});

foam.CLASS({
  package: 'foam.net',
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
