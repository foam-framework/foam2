/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
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

// TODO(markdittmer): Should this be an Outputer implementation?
foam.CLASS({
  package: 'com.google.urlz',
  name: 'JSONFetcher',

  requires: [
    'com.google.urlz.DObjectLocal',
    'com.google.urlz.functors.Error',
    'foam.net.HTTPRequest'
  ],

  properties: [
    'url',
    'dataPath'
  ],

  methods: [
    function fetch() {
      return this.HTTPRequest.create({
        responseType: 'json',
        headers: {
          'content-type': 'application/json',
          'user-agent': 'URLZ'
        },
        url: this.url
      }).send().then(this.onResponse, this.onError);
    },
    function getCls(o, remote) {
      remote = remote ? 'Remote' : 'Local';
      var pkg = 'com.google.urlz';
      var ps = Object.keys(o).sort();
      var name = `DObject${remote}_${ps.join('_')}`;
      var id = `${pkg}.${name}`;
      var cls = this.lookup(id, true);
      if ( cls ) return cls;

      foam.CLASS({
        package: pkg,
        name: name,
        extends: `com.google.urlz.DObject${remote}`,
        exports: remote ? [ 'as src__' ] : [],

        properties: ps
      });
      return this.lookup(id);
    },
    function liftData_(data, ctx) {
      var type = foam.typeOf(data);
      if ( type !== foam.Object ) return data;

      var cls = this.getCls(data, !! ctx);
      var o = cls.create(null, ctx || this.__subContext__.createSubContext({
        Fetch: this.fetch.bind(this),
        src__: this.url
      }));
      ctx = ctx || o;

      for ( var key in data ) {
        if ( ! data.hasOwnProperty(key) ) continue;
        o[key] = this.liftData_(data[key], ctx);
      }
      return o;
    }
  ],

  listeners: [
    function onResponse(response) {
      if ( response.status !== 200 ) return this.onHTTPError(response);
      return response.payload.then(this.onPayload);
    },
    function onPayload(json) {
      var data = json;
      var path = this.dataPath;
      if ( Array.isArray(path) ) {
        for ( var i = 0; i < path.length; i++ ) {
          data = data[path[i]];
          if ( data === undefined ) throw this.Error.create({
            message: `Failed to look up JSON data path ${path.slice(0, i).join('.')}`
          });
        }
      } else if ( path ) {
        data = data[path];
      }
      return this.liftData_(data);
    },
    function onHTTPError(response) {
      var Error = this.Error;
      return response.payload.then(function(payload) {
        throw new Error.create({
          message: `Bad HTTP status code: ${response.status}\nPayload: ${payload}`
        });
      }, function(error) {
        throw new Error.create({
          message: `Bad HTTP status code: ${response.status}\nError fetching payload: ${error}`
        });
      });
    },
    function onError(error) {
      // TODO(markdittmer): Anything to be done here?
      throw error;
    }
  ]
});
