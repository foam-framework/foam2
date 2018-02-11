foam.CLASS({
  package: 'foam.tools',
  name: 'Build',

  requires: [
    'foam.classloader.OrDAO',
    'foam.core.Model',
    'foam.dao.DAOSink',
    'foam.dao.DecoratedDAO',
    'foam.dao.LoggingDAO',
    'foam.json2.Deserializer',
    'foam.json2.Serializer',
  ],

  implements: [
    'foam.mlang.Expressions',
  ],

  imports: [
    'classloader',
  ],

  exports: [
    'flags',
    'json2Deserializer',
    'json2Serializer',
  ],

  properties: [
    {
      name: 'modelId',
      value: 'foam.tools.Build',
    },
    {
      class: 'StringArray',
      name: 'flags',
      factory: function() { return ['js', 'web'] },
    },
    {
      class: 'String',
      name: 'output',
      view: { class: 'foam.u2.tag.TextArea', rows: 16 },
    },
    {
      name: 'json2Serializer',
      hidden: true,
      factory: function() {
        return this.Serializer.create()
      },
    },
    {
      name: 'json2Deserializer',
      hidden: true,
      factory: function() {
        return this.Deserializer.create({parseFunctions: true})
      },
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
      name: 'SerializeDeserializeDAODecorator',
      extends: 'foam.dao.AbstractDAODecorator',
      documentation: `
        A decorator that serializes and deserializes objects that are read. This
        is useful for stripping objects based on flags.
      `,
      methods: [
        function read(X, dao, obj) {
          var s = X.json2Serializer;
          var d = X.json2Deserializer;
          return d.aparseString(X, s.stringify(X, obj))
        },
      ],
    },
    {
      name: 'JSON2FileWriteDAODecorator',
      extends: 'foam.dao.AbstractDAODecorator',
      properties: [
        {
          name: 'root',
          value: 'TESTOUTPUT/',
        },
      ],
      methods: [
        function write(x, dao, o) {
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
          fs.writeFileSync(file, x.json2Serializer.stringify(x, o), 'utf8');

          return Promise.resolve(o);
        },
      ]
    },
    {
      name: 'DepPutModelDAO',
      extends: 'foam.dao.ProxyDAO',
      requires: [
        'foam.core.Model',
        'foam.dao.DAOSink',
      ],
      implements: [
        'foam.mlang.Expressions',
      ],
      properties: [
        {
          name: 'modelDAO',
        },
        {
          name: 'puts',
          factory: function() { return {} },
        },
      ],
      methods: [
        function put_(x, o) {
          if ( ! this.puts[o.id] ) {
            var self = this;
            this.puts[o.id] = this.delegate.put_(x, o).then(function(o) {
              var json = JSON.parse(x.json2Serializer.stringify(x, o));
              var deps = json['$DEPS$'].concat(o.getClassDeps());
              return self.modelDAO.where(self.IN(self.Model.ID, deps))
                  .select(self.DAOSink.create({dao: self}))
            }).then(function() {
              return o;
            });
          }
          return this.puts[o.id];
        },
      ],
    },
  ],

  methods: [
    function log(_, m) {
      var s = m.id;
      this.output = this.output ? this.output + '\n' + s : s
    },
  ],

  actions: [
    function execute() {
      var srcDAO = this.FindInDAO.create({
        delegate: this.DecoratedDAO.create({
          decorator: this.SerializeDeserializeDAODecorator.create(),
          delegate: this.OrDAO.create({
            primary: this.ModelLookupDAO.create(),
            delegate: this.classloader.modelDAO,
          })
        })
      });

      var destDAO = this.DepPutModelDAO.create({
        modelDAO: srcDAO,
        delegate: foam.isServer ?
            this.DecoratedDAO.create({decorator: this.JSON2FileWriteDAODecorator.create()}) :
            this.LoggingDAO.create({logger: this.log.bind(this)}),
      })

      srcDAO.where(this.IN(this.Model.ID, [this.modelId]))
          .select(this.DAOSink.create({dao: destDAO}))
    }
  ]
});
