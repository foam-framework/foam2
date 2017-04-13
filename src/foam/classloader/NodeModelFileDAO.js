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
      name: 'loadedModels',
      documentation: `Retain a copy of loaded models in case they are requested
        later. This can happen, for example, if a modl is loaded twice in
        different contexts. Subsequent require() calls will not re-invoke
        foam.CLASS(), hence the model loaded the first time must be retained.`,
      value: {}
    }
  ],

  methods: [
    function find(id) {
      var foamCLASS = foam.CLASS;
      var self = this;
      var model = this.loadedModels[id] || null;

      if ( model ) return Promise.resolve(model);

      foam.CLASS = function(clsDef) {
        var classOfModel = clsDef.class ? foam.lookup(clsDef.class) :
              foam.core.Model;
        var modelOfClass = classOfModel.create(clsDef, self);
        if ( modelOfClass.id === id ) {
          model = modelOfClass;
        } else {
          // TODO(markdittmer): We should do something more reasonable here, but
          // the DAO API only allows us to deliver one model in response to
          // find().
          console.warn(
            'Class', id, 'created via arequire, but never built or registered');
        }
        self.loadedModels[modelOfClass.id] = modelOfClass;
      };

      var sep = require('path').sep;
      var path = this.classpath + sep + id.replace(/\./g, sep) + '.js';

      try {
        require(path);
      } catch(e) {
        console.warn('Unable to load at ' + path + '. Error: ' + e.stack);
        return Promise.resolve(null);
      } finally {
        foam.CLASS = foamCLASS;
      }

      return Promise.resolve(model);
    }
  ]
});
