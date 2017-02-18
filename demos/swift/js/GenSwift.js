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
  name: 'GenSwift',
  requires: [
    'foam.core.Model',
    'foam.swift.SwiftClass',
    'foam.swift.Field',
    'foam.swift.Method',
  ],
  imports: [
    'arequire',
  ],
  properties: [
    {
      class: 'StringArray',
      name: 'models',
    },
    {
      class: 'String',
      name: 'outdir',
    },
    {
      name: 'fs',
      factory: function() { return require('fs'); }
    },
  ],
  methods: [
    function execute() {
      var self = this;
      if ( !this.outdir ) {
        console.log('ERROR: outdir not specified');
        process.exit(1);
      }
      self.fs.mkdirSync(this.outdir);
      var promises = [];
      for (var i = 0; i < this.models.length; i++) {
        promises.push(this.arequire(this.models[i]));
      }
      return Promise.all(promises).then(function() {
        var sep = require('path').sep;
        var resources = [];
        for (var i = 0; i < self.models.length; i++) {
          var cls = self.lookup(self.models[i], self);
          var fileName = self.outdir + sep + cls.id.replace(/\./g, '_') + '.swift';
          self.fs.writeFileSync(
              fileName,
              cls.toSwiftClass().toSwiftSource());
        }
      }).catch(function(err) {
        console.log('Error', err);
      });
    }
  ]
});
