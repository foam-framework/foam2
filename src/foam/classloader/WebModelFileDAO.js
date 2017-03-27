/**
 * @license
 * Copyright 2017 Google Inc. All Rights Reserved.
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
  package: 'foam.classloader',
  name: 'WebModelFileDAO',
  extends: 'foam.dao.AbstractDAO',

  imports: [
    'window'
  ],

  requires: [
    'foam.net.web.HTTPRequest'
  ],

  properties: [
    {
      name: 'url',
      factory: function() {
        return this.window.location.protocol + '//' + this.window.location.host + '/src/';
      }
    }
  ],

  methods: [
    function find(id) {
      var self = this;
      var url  = this.url + '/' + id.replace(/\./g, '/') + '.js';
      var req  = this.HTTPRequest.create({
        method: 'GET',
        url: url
      });

      return req.send().then(function(payload) {
        return payload.resp.text();
      }).then(function(js) {
        // Return null if model not found.
        var model = null;
        var foamCLASS = foam.CLASS;

        foam.CLASS = function(m) {
          var cls = m.class ? foam.lookup(m.class) : foam.core.Model;
          var mdl = cls.create(m, self);
          // Loaded file may contain multiple CLASS calls. Only return this
          // model if its id matches the requested id.
          if ( mdl.id === id ) {
            model = mdl;
          } else {
            // TODO(markdittmer): We should do something more reasonable here, but
            // the DAO API only allows us to deliver one model in response to
            // find().
            console.warn(
              'Class', id, 'created via arequire, but never built or registered');
          }
        };

        try {
          eval(js);
        } catch(e) {
          console.warn('Unable to load at ' + url + '. Error: ' + e.stack);
          return Promise.resolve(null);
        } finally {
          foam.CLASS = foamCLASS;
        }

        return Promise.resolve(model);
      });
    }
  ]
});
