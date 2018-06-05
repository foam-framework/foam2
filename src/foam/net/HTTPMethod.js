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

foam.CLASS({
  package: 'foam.net',
  name: 'HTTPMethod',
  extends: 'foam.core.Method',

  documentation: `
  A method that is configured to call a service over HTTP.
  No code or function body is required here, as the actual body is generated to
  call the remote service. This will always return a promise that supplies the
  return value of the service call.

  <p>Overriding by an HTTPMethod is not supported. You can override an
  HTTPMethod with a normal one.
  `,

  requires: [
    'foam.net.HTTPArgument',
  ],

  constants: {
    OUTPUTTER: {
      __proto__: foam.json.Strict,
      outputDefaultValues: false,
      outputClassNames: false
    }
  },

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
      of: 'foam.net.HTTPArgument',
      factory: function() { return []; }
    },
    {
      /** If the request should build a request body object and fill in the
        supplied args, the request object's Class is specified here. */
      class: 'Class',
      name: 'buildRequestType',
    },
    {
      /** HTTPMethods will always return a Promise, but the Promise will pass
        along a parameter of the type specified here. */
      name: 'promisedType',
      of: 'foam.core.Argument'
    },
    [ 'returns', 'Promise' ],
    {
      /** The name of the HTTP factory to import at run time. Instances of
        HTTPMethod on a class will cause the class to import this name, and
        when called will call hostInstance.yourHttpFactoryName.create() to
        create a partially filled request object. */
      name: 'HTTPRequestFactoryName',
      value: 'HTTPRequestFactory'
    },
    {
      name: 'code',
      required: false,
      transient: true,
      expression: function(args) {
        // set up function with correct args, pass them into the
        // actual implementation, callRemote_()
        var axiom = this;
        // Get list of argument names
        var argNames = args.map(axiom.HTTPArgument.NAME.f);
        // load named values into opt_args object and pass to the generic callRemote_()
        return function() {
          var opt_args = {};
          for ( var i = 0; i < arguments.length && i < argNames.length; i ++ ) {
            opt_args[argNames[i]] = arguments[i];
          }
          return axiom.callRemote_(opt_args, this);
        }

      }
    }
  ],

  methods: [
    function installInClass(c) {
      // add an import for the HTTPRequestFactory on our host class

      // May have many HTTPMethods in a host class, but only do service import once.
      var existing = c.getAxiomByName(this.HTTPRequestFactoryName);
      foam.assert( existing,
        "HTTPMethod installInClass did not find an import or property", this.HTTPRequestFactoryName, ".",
        "Provide one, or set HTTPMethod.HTTPRequestFactoryName to the name of your request factory function.");
    },

    function installInProto(p) {
      // set code on proto
      p[this.name] = this.code;
    },

    function callRemote_(opt_args, host) {
      foam.assert( typeof host[this.HTTPRequestFactoryName] === 'function',
        "HTTPMethod call can't find HTTPRequestFactory",
        this.HTTPRequestFactoryName, "on", host);

      // 'this' is the axiom instance
      var self = this;
      var path = this.path;
      var query = "";
      var request = host[this.HTTPRequestFactoryName]();

      // if building a request object, start with an empty instance
      var requestObject = self.buildRequestType ?
        self.buildRequestType.create(undefined, foam.__context__) : null;

      // add on args passed as part of the path or query
      self.args.forEach(function(param) {
        var val = opt_args[param.name];
        if ( typeof val === 'undefined' ) return; // skip missing args // TODO: assert non-optional

        // put the dot back if we removed one from the name
        var pname = param.name.replace('__dot__','.');
        if ( param.location === 'body' ) {
          // set the request body content
          // TODO: assert it's the first param, no more than one body
          if ( requestObject ) {
            throw "Can't set both RequestObject " +
              self.buildRequestType + " and param.location==body for " + pname;
          }
          request.payload = self.OUTPUTTER.stringify(val);
        } else if ( param.location === 'path' ) {
          // find the placeholder and replace it
          path = path.replace("{"+pname+"}", val.toString());
          if ( requestObject ) requestObject[pname] = val;
        } else if ( param.location === 'query' ) {
          // add to query string
          query += "&" + pname + "=" + val.toString();
          if ( requestObject ) requestObject[pname] = val;
        }
      });
      path = path + ( query ? "?" + query.substring(1) : "" );
      request.path += path;
      request.method = self.httpMethod;
      if ( requestObject ) {
        request.payload = self.OUTPUTTER.stringify(requestObject);
      }

      return request.send().then(function(response) {
        if ( response.status >= 400 ) {
          throw "HTTP error status: " + response.status;
        }
        foam.assert(response.responseType === 'json', "HTTPMethod given a request not configured to return JSON", request);
        return response.payload.then(function(json) {
          if ( ! self.promisedType ) {
            // no return
            return;
          }
          if ( ! self.promisedType.type ) { // TODO: should not need this check. Getter in Arg.type?
            self.promisedType.type = this.lookup(self.promisedType.typeName, true);
          }
          if ( self.promisedType.type ) {
            // a modelled return type
            return self.promisedType.type.create(json, host);
          }
          // else return raw json
          return json;
        });
      });
    }
  ]
});


foam.CLASS({
  package: 'foam.net',
  name: 'HTTPArgument',
  extends: 'foam.core.Argument',

  properties: [
    {
      /** The location to put this value in the request: 'query', 'path', or 'body' */
      name: 'location',
      value: 'query',
    }
  ]
});
