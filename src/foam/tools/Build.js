foam.CLASS({
  package: 'foam.tools',
  name: 'Build',

  requires: [
    'foam.classloader.OrDAO',
    'foam.core.Model',
    'foam.dao.DAOSink',
  ],

  implements: [
    'foam.mlang.Expressions',
  ],

  imports: [
    'classloader',
  ],

  exports: [
    'log',
    'flags',
  ],

  properties: [
    {
      name: 'modelId',
      value: 'foam.tools.Build',
    },
    {
      class: 'String',
      name: 'output',
      view: { class: 'foam.u2.tag.TextArea', rows: 16 },
    },
    {
      class: 'StringArray',
      name: 'flags',
      factory: function() { return ['js', 'web'] },
    },
  ],

  classes: [
    {
      name: 'FindInDAO',
      extends: 'foam.dao.ProxyDAO',
      requires: [
        'foam.mlang.predicate.In',
      ],
      methods: [
        function select_(x, sink, _, _, _, predicate) {
          if ( ! this.In.isInstance(predicate) ) {
            throw 'Only supports selecting with an "In" predicate';
          }
          var self = this;
          var promises = predicate.arg2.value.map(function(id) {
            return self.find_(x, id).then(function(m) { sink.put(m) });
          });
          return Promise.all(promises).then(function() { return sink });
        }
      ]
    },
    {
      name: 'ModelLookupDAO',
      extends: 'foam.dao.AbstractDAO',
      methods: [
        {
          name: 'find_',
          code: function(x, id) {
            return new Promise(function(ret) {
              var cls = foam.lookup(id, true);
              ret(cls ? cls.model_ : undefined);
            });
          }
        }
      ]
    },
    {
      name: 'OutputDAO',
      extends: 'foam.dao.ProxyDAO',
      requires: [
        'foam.json2.Serializer',
        'foam.json2.Deserializer',
      ],
      imports: [
        'log',
        'flags',
      ],
      properties: [
        {
          name: 'root',
          value: 'TESTOUTPUT/',
        },
        {
          name: 'puts',
          factory: function() { return {} },
        },
        {
          hidden: true,
          name: 'outputter',
          factory: function() {
            return this.Serializer.create()
          },
        },
        {
          hidden: true,
          name: 'deserializer',
          factory: function() {
            return this.Deserializer.create({parseFunctions: true})
          },
        },
      ],
      methods: [
        function put_(x, o) {
          var self = this;

          if ( self.puts[o.id] ) return self.puts[o.id];

          // Serialization strips axioms without the proper flags and
          // deserializing that results in an object without those axioms.
          var s = self.outputter.stringify(x, o);
          var json = JSON.parse(s);
          return self.deserializer.aparse(x, json).then(function(o) {
            var deps = json['$DEPS$'].concat(o.getClassDeps());
            var promises = deps.map(function(id) {
              return self.delegate.find(id).then(function(m) {
                self.put_(x, m);
              });
            });

            if ( foam.isServer ) {
              var sep = require('path').sep;
              var dir = self.root + o.package.replace(/\./g, sep);
              var file = `${dir}${sep}${o.name}.json`;

              var fs = require('fs');
              var dirs = dir.split(sep);
              dir = '';
              while ( dirs.length ) {
                dir = dir + dirs.shift() + sep;
                if( ! fs.existsSync(dir) ){
                  fs.mkdirSync(dir)
                }
              }
              fs.writeFileSync(file, s, 'utf8');
            } else {
              self.log(o.id);
              self.log(s);
            }

            var p = Promise.all(promises);
            self.puts[o.id] = p
            return p;
          });
        }
      ]
    },
  ],

  methods: [
    function log(s) {
      this.output = this.output ? this.output + '\n' + s : s
    },
  ],

  actions: [
    function execute() {
      var self = this;

      var modelDAO = self.FindInDAO.create({
        delegate: self.OrDAO.create({
          primary: self.ModelLookupDAO.create(),
          delegate: self.classloader.modelDAO,
        })
      });

      modelDAO.where(self.IN(self.Model.ID, [self.modelId]))
          .select(self.DAOSink.create({dao: self.OutputDAO.create({delegate: modelDAO})}))
    }
  ]
});
