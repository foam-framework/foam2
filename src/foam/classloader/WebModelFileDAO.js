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
    function find_(x, id) {
      var self = this;
      var url  = this.url + '/' + id.replace(/\./g, '/') + '.js';
      var req  = this.HTTPRequest.create({
        method: 'GET',
        url: url
      });
      var lookingFor = id;

      return req.send().then(function(payload) {
        return payload.resp.text();
      }).then(function(js) {
        var model;
        var foamCLASS = foam.CLASS;

        foam.CLASS = function(m) {
          if ( ( ( m.package ? m.package + '.' : '' ) + m.name ) !== lookingFor ) {
            // Run unrelated models through normal foam.CLASS
            foamCLASS(m);
            return;
          }

          var cls = m.class ? foam.lookup(m.class) : foam.core.Model;
          model = cls.create(m, self);
          foam.CLASS = foamCLASS;
        };

        try {
          eval('//# sourceURL=' + url + '\n' + js);
        } catch(e) {
          console.warn('At ', url, 'line:' + (e.lineNumber - 1));
          console.warn(e.message);
          return Promise.resolve(null);
        } finally {
          foam.CLASS = foamCLASS;
        }

        return Promise.resolve(model);
      }).catch(function(e) {
        return Promise.resolve(null);
      });
    }
  ]
});
