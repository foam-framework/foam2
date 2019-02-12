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
  name: 'NodeModelFileDAO',
  extends: 'foam.dao.AbstractDAO',

  properties: [
    {
      name: 'classpath'
    },
    {
      name: 'suppressWarning'
    }
  ],

  methods: [
    function find_(x, id) {
      var foamCLASS = foam.CLASS;
      var self = this;
      var model;

      foam.CLASS = function(m) {
        var cls = m.class ? foam.lookup(m.class) : foam.core.Model;
        model = cls.create(m, self);
        foam.CLASS = foamCLASS;
      }

      var sep = require('path').sep;
      var path = this.classpath + sep + id.replace(/\./g, sep) + '.js';

      try {
        require(path);
      } catch(e) {
        if ( ! self.suppressWarning ) {
          console.warn('Unable to load ', path);
          console.warn(e);
        }
        return Promise.reject(e);
      } finally {
        foam.CLASS = foamCLASS;
      }

      return Promise.resolve(model);
    }
  ]
});
