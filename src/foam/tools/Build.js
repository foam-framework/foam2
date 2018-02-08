foam.CLASS({
  package: 'foam.tools',
  name: 'Build',

  requires: [
    'foam.classloader.OrDAO',
    'foam.core.Model',
    'foam.dao.DAOSink',
    'foam.json2.Serializer',
  ],

  implements: [
    'foam.mlang.Expressions',
  ],

  imports: [
    'classloader',
  ],

  exports: [
    'log',
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
      ],
      imports: [
        'log'
      ],
      properties: [
        {
          name: 'root',
          value: 'TESTOUTPUT/',
        },
        {
          class: 'StringArray',
          name: 'flags',
          value: ['web'],
        },
        {
          name: 'puts',
          factory: function() { return {} },
        },
        {
          hidden: true,
          name: 'outputter',
          factory: function() {
            var flags = this.flags;
            return this.Serializer.create({
              axiomPredicate: function(a) {
                if ( a.flags ) {
                  for ( var i = 0; i < flags.length; i++ ) {
                    if ( p.flags[flags[i]] ) return true;
                  }
                  return false;
                }
                return true;
              }
            });
          },
        },
      ],
      methods: [
        function put_(x, o) {
          var self = this;

          if ( self.puts[o.id] ) return self.puts[o.id];

          var s = this.outputter.stringify(x, o)
          var deps = JSON.parse(s)['$DEPS$'].concat(o.getClassDeps());

          var promises = deps.map(function(id) {
            return self.delegate.find(id).then(function(m) {
              self.put_(x, m);
            });
          });

          if ( foam.isServer ) {
            var sep = require('path').sep;
            var dir = this.root + o.package.replace(/\./g, sep);
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
            this.log(o.id);
            this.log(s);
          }

          var p = Promise.all(promises);
          self.puts[o.id] = p
          return p;
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
