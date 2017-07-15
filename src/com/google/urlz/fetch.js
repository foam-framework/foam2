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

// route fetches based on remappings
// check context, __url_map__ that is inherited down context layers
// Each type should take a delegate to chain together, fall back to delegate on fail
// CLientStub created by server to work with stubRoot: FilteredHTTPFetcher(CORSList) <- LocalFetcher(stubRoot)
foam.CLASS({
  package: 'com.google.urlz',
  name: 'Fetcher',
  
  properties: [
    'delegate'
  ],
  
  methods: [
    {
      name: 'fetchImpl_', 
      args: ['url'], 
      returns: 'Promise(com.google.urlz.DObject)' 
    },
    {
      name: 'commitImpl_', 
      args: ['url', 'obj'], 
      returns: 'Promise(com.google.urlz.DObject)'
    },
    function fetch(url) {
      // if we failed to resolve obj due to missing properties, try our delegate
      return this.fetchImpl_(url).catch(err => this.delegate ? this.delegate.fetch(url) : throw err);
    },
    function commit(url, obj) {
      return this.commitImpl_(url, obj).catch(err => this.delegate ? this.delegate.commit(url, obj) : throw err)
    }
  ]
});


foam.CLASS({
  package: 'com.google.urlz',
  name: 'LocalFetcher',
  extends: 'com.google.urlz.Fetcher',
  documentation: 'Traverses properties to find the local instance of an object',
  
  properties: [
    {
      name: 'rootObject',
    }
  ],
  
  methods: [
    function fetchImpl_(url) {
      // url must be relative or absolute with the prefix matching our root object
      path = Url(url).relativeTo(this.rootObject.src__).split('/');
      var obj = this.rootObject;
      path.forEach(pname => { obj = obj[pname]; });
      if ( obj) return obj;
      
      throw `LocalFetch: Not Found! ${url} ${path} in ${this}`;
    },
    function commitImpl_(url, nuObj) {
      // url must be relative or absolute with the prefix matching our root object
      path = Url(url).relativeTo(this.rootObject.src__).split('/');
      var obj = this.rootObject;
      path.forEach(pname => { obj = obj[pname]; });
      if ( obj) obj.copyFrom(nuObj);
      
      throw `LocalCommit: Not Found! ${url} ${path} in ${this}`;
    }
  ]
});




// TODO(markdittmer): Should this be an Outputer implementation?
// TODO(jacksonic): take datapath as the fetch(datapath) arg, make HTTPFetcher and extend for JSON?
foam.CLASS({
  package: 'com.google.urlz',
  name: 'JSONFetcher',

  requires: [
    'com.google.urlz.DObjectRemote',
    'com.google.urlz.functors.Error',
    'foam.net.HTTPRequest'
  ],

  properties: [
    'url',
    'dataPath',
    [ 'baseDObjectClsName', 'DObjectCached' ]
  ],

  methods: [
    function fetch() {
      console.log('Fetch', this.url);
      return this.HTTPRequest.create({
        responseType: 'json',
        headers: {
          'content-type': 'application/json',
          'user-agent': 'URLZ'
        },
        url: this.url
      }).send().then(this.onResponse, this.onError);
    },
    function getCls(o) {
      var baseName = this.baseDObjectClsName;
      var pkg = 'com.google.urlz';
      var ps = Object.keys(o).sort();
      var name = `${baseName}_${ps.join('_')}`;
      var id = `${pkg}.${name}`;
      var cls = this.lookup(id, true);
      if ( cls ) return cls;

      foam.CLASS({
        package: pkg,
        name: name,
        extends: `com.google.urlz.${baseName}`,

        properties: ps
      });
      return this.lookup(id);
    },
    function liftData_(data, ctx) {
      var type = foam.typeOf(data);
      if ( type !== foam.Object ) return data;

      var cls = this.getCls(data);
      var o = cls.create(null, ctx || this.__subContext__.createSubContext({
        src__: this.DObjectRemote.create(null, this.__subContext__.createSubContext({
          Fetch: this.fetch.bind(this),
          src__: this.url
        }))
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
