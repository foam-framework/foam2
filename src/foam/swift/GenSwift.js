/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.swift',
  name: 'GenSwift',
  requires: [
    'foam.core.Model',
    'foam.swift.Enum',
    'foam.swift.EnumValue',
    'foam.swift.SwiftClass',
    'foam.swift.EmptyClass',
    'foam.swift.Field',
    'foam.swift.Method',
  ],
  imports: [
    'classloader',
  ],
  properties: [
    {
      class: 'StringArray',
      name: 'models',
    },
    {
      name: 'coreModels',
      value: [
        'foam.core.EventProxy',
        'foam.json2.SimpleOutputterOutput', // TODO figure out why this isn't picked up automatically.
        'foam.mlang.order.Comparator',
        'foam.mlang.predicate.Predicate',
        'foam.swift.core.ConstantSlot',
        'foam.swift.core.ExpressionSlot',
        'foam.swift.core.PropertySlot',
        'foam.swift.core.Slot',
        'foam.swift.core.SubSlot',
        'foam.swift.parse.PStream',
        'foam.swift.parse.json.AnyKeyParser',
        'foam.swift.parse.json.AnyParser',
        'foam.swift.parse.json.ArrayParser',
        'foam.swift.parse.json.BooleanParser',
        'foam.swift.parse.json.DateParser',
        'foam.swift.parse.json.ExprParser',
        'foam.swift.parse.json.FObjectArrayParser',
        'foam.swift.parse.json.FObjectParser',
        'foam.swift.parse.json.FloatParser',
        'foam.swift.parse.json.IntParser',
        'foam.swift.parse.json.LongParser',
        'foam.swift.parse.json.MapParser',
        'foam.swift.parse.json.NullParser',
        'foam.swift.parse.json.PropertyParser',
        'foam.swift.parse.json.UnknownPropertyParser',
        'foam.swift.parse.json.output.Outputter',
        'foam.swift.parse.parser.Alt',
        'foam.swift.parse.parser.AnyChar',
        'foam.swift.parse.parser.Chars',
        'foam.swift.parse.parser.Fail',
        'foam.swift.parse.parser.Not',
        'foam.swift.parse.parser.NotChar',
        'foam.swift.parse.parser.NotChars',
        'foam.swift.parse.parser.Parser',
        'foam.swift.parse.parser.Repeat',
        'foam.swift.parse.parser.Repeat0',
        'foam.swift.parse.parser.Seq',
        'foam.swift.parse.parser.Seq0',
        'foam.swift.parse.parser.Seq2',
        'foam.swift.parse.parser.Substring',
      ],
    },
    {
      name: 'blacklist',
      value: [
        'FObject',
        'foam.core.AbstractInterface',
        'foam.swift.ui.AbstractGenIBOutletDetailView',
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

      var axiomFilter = foam.util.flagFilter(['swift']);

      if ( !this.outdir ) {
        console.log('ERROR: outdir not specified');
        process.exit(1);
      }
      self.fs.mkdirSync(this.outdir);
      var promises = [];
      this.coreModels.concat(this.models).forEach(function(m) {
        promises.push(self.classloader.load(m));
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
            cls.getAxiomsByClass(foam.core.Requires).filter(axiomFilter).forEach(function(r) {
              queue.push(r.path);
            });
            cls.getAxiomsByClass(foam.core.Implements).filter(axiomFilter).forEach(function(r) {
              queue.push(r.path);
            });
            if (cls.model_.extends) queue.push(cls.model_.extends);
          }
        }
        models = Object.keys(models)
            .filter(function(m) {
              return self.blacklist.indexOf(m) == -1;
            });

        var classes = [];
        for (var i = 0; i < models.length; i++) {
          var cls = self.lookup(models[i], self);
          var swiftClass = cls.toSwiftClass();
          if (swiftClass.getMethod && swiftClass.getMethod('classInfo')) {
            classes.push(swiftClass.name);
          }
          var fileName = self.outdir + sep + cls.id.replace(/\./g, '_') + '.swift';
          self.fs.writeFileSync(
              fileName,
              swiftClass.toSwiftSource());
        }
        var regClass = self.SwiftClass.create({
          type: 'extension',
          name: 'FOAM_utils',
        });
        regClass.methods.push(self.Method.create({
          name: 'registerClasses',
          args: [
            foam.swift.Argument.create({
              localName: 'x',
              type: 'Context',
            })
          ],
          static: true,
          body: classes.map(function(c) {
            return 'x.registerClass(cls: '+c+'.classInfo())'
          }).join('\n')
        }));
        var fileName = self.outdir + sep + 'RegisterClasses.swift';
        self.fs.writeFileSync(
            fileName,
            regClass.toSwiftSource());
      }).catch(function(err) {
        console.log('Error', err);
      });
    }
  ]
});
