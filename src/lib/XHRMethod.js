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
      /** The server path prefix. Parameters may add to the path */
      name: 'pathPrefix'
    },
    {
      name: 'httpMethod',
      value: 'GET'
    },
    {
      /** The parameters to call with, in order */
      class: 'FObjectArray',
      name: 'parameters',
      of: 'foam.core.XHRArgument',
    },
    {
      /** XHRMethods will always return a Promise, but the Promise will pass
        along a parameter of the type specified here. */
      name: 'returns'
    }
  ],

  methods: [
    function installInProto(p) {
      // generate body to call through to xhr
      var axiom = this;

      // set up function with correct args, pass them into the
      // actual implementation, callRemote_()
      var code = "function "+axiom.name+"(";
      var names = this.parameters.map(axiom.XHRArgument.NAME);
      code += names.join(', ');
      code += ') {\n';
      code += 'var opt_args = {\n';
      names.forEach(function(name) {
        code += '  '+name+': "'+name+',\n';
      });
      code += '};\n';
      code += 'return axiom.callRemote_(opt_args);\n';

      code = eval(code);
      p[axiom.name] = code;
    },

    function callRemote_(/* object */ opt_args /* Promise */) {
      // do the xhr, promise
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
      name: 'location'
    },
    // optional
  ],
 });
