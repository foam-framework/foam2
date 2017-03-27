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
    { class: 'String', name: 'classpath' },
    { name: 'sep', factory: function() { return require('path').sep; } },
    { name: 'fs',  factory: function() { return require('fs');       } },
    { name: 'vm',  factory: function() { return require('vm');       } }
  ],

  methods: [
    function find(id) {
      var self = this;
      var path = this.classpath + this.sep + id.replace(/\./g, this.sep) + '.js';

      return new Promise(function(resolve, reject) {
        self.fs.readFile(path, 'utf8', function(error, data) {
          if ( error ) {
            console.warn('Unable to load at ' + path + '. Error: ' +
                error.message + '\n' + error.stack);
            resolve(null);
          }

          self.vm.runInThisContext(data.toString(), {filename: path});

          var cls = foam.lookup(id, true);

          if ( ! cls ) {
            console.warn(
                'Class', id, 'created via arequire, but never built or registered');
          }

          resolve(cls.model_);
        });
      });
    }
  ]
});
