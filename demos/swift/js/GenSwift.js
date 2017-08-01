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
      name: 'coreModels',
      value: [
        'foam.mlang.order.Comparator',
        'foam.mlang.predicate.Predicate',
        'foam.swift.core.ConstantSlot',
        'foam.swift.core.ExpressionSlot',
        'foam.swift.core.PropertySlot',
        'foam.swift.core.Slot',

        'foam.swift.parse.PStream',
        'foam.swift.parse.parser.Alt',
        'foam.swift.parse.parser.Not',
        'foam.swift.parse.parser.AnyChar',
        'foam.swift.parse.parser.NotChars',
        'foam.swift.parse.parser.Repeat0',
        'foam.swift.parse.parser.Seq',
        'foam.swift.parse.parser.Seq0',
        'foam.swift.parse.parser.Seq2',
        'foam.swift.parse.parser.Substring',
        'foam.swift.parse.parser.Repeat',
        'foam.swift.parse.parser.Chars',
        'foam.swift.parse.parser.NotChar',
        'foam.swift.parse.parser.Fail',
        'foam.swift.parse.json.output.Outputter',
        'foam.swift.parse.json.AnyKeyParser',
        'foam.swift.parse.json.AnyParser',
        'foam.swift.parse.json.ArrayParser',
        'foam.swift.parse.json.BooleanParser',
        'foam.swift.parse.json.DateParser',
        'foam.swift.parse.json.ExprParser',
        'foam.swift.parse.json.FObjectArrayParser',
        'foam.swift.parse.json.FObjectParser',
        'foam.swift.parse.json.IntParser',
        'foam.swift.parse.json.LongParser',
        'foam.swift.parse.json.MapParser',
        'foam.swift.parse.json.NullParser',
        'foam.swift.parse.json.PropertyParser',
        'foam.swift.parse.json.FloatParser',
        'foam.swift.parse.parser.Parser',
      ],
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
      this.coreModels.concat(this.models).forEach(function(m) {
        promises.push(self.arequire(m));
      })
      return Promise.all(promises).then(function() {
        var sep = require('path').sep;
        var models = {};
        var queue = self.models.concat(self.coreModels);
        while (queue.length) {
          var model = queue.pop();
          if (!models[model]) {
            models[model] = 1;
            var cls = self.lookup(model);
            cls.getAxiomsByClass(foam.core.Requires).forEach(function(r) {
              queue.push(r.path);
            });
            cls.getAxiomsByClass(foam.core.Implements).forEach(function(r) {
              queue.push(r.path);
            });
            if (cls.model_.extends) queue.push(cls.model_.extends);
          }
        }
        models = Object.keys(models);

        for (var i = 0; i < models.length; i++) {
          var cls = self.lookup(models[i], self);
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
