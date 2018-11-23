foam.CLASS({
  package: 'foam.build',
  name: 'DirectoryTreeDAO',
  extends: 'foam.dao.AbstractDAO',
  documentation: `Stores objects in a directory tree.`,
  requires: [
    'foam.json2.Serializer',
    'foam.json2.Deserializer'
  ],
  properties: [
    {
      class: 'String',
      name: 'root'
    },
    {
      name: 'serializer',
      factory: function() {
        return this.Serializer.create();
      }
    },
    {
      name: 'deserializer',
      factory: function() [
        return this.Deserializer.create();
      }
    },
    {
      name: 'index'
    },
    {
      name: 'fs'
    }
  ],
  methods: [
    {
      name: 'pathFor_',
      args: [
        { name: 'id', type: 'String' },
      ],
      code: function(id) {
      }
    },
    {
      name: 'loadFile_',
      args: [ { name: 'path', type: 'Stirng' } ],
      async: true,
      returns: 'foam.core.FObject',
      code: function(path) {
        return new Promise(function(resolve, reject) {
          requires('fs').readFile(path, { encoding: 'utf8' }, function(err, data) {
            if ( err ) reject(err);
            else resolve(data);
          });
        }).then(function(data) {
          return this.deserializer.parseString(this.__context__, data);
        }.bind(this));
      }
    },
    {
      name: 'select_',
      code: function(x, sink, skip, limit, order, predicate) {
        sink = sink || this.ArraySink.create();

        var mysink = this.decorateSink_(sink, skip, limit, order, predicate);

        var detached = false;
        var sub = foam.core.FObject.create();
        sub.onDeatch(function() { detached = true; });

        return Promise.all(this.index.map(function(path) {
          return this.loadFile_(path).then(function(obj) {
            if ( detached ) return;
            mysink.put(obj, sub);
          });
        }.bind(this))).then(function(objs) {
          mysink.eof();

          return sink;
        });
      }
    },
    {
      name: 'find_',
      code: function(id) {
        return this.index.find(id).then(function(path) {
          return this.loadFile_(path);
        }, function() { return null; });
      }
    },
    {
      name: 'put_',
      code: function(x, obj) {
        return this.index.find(obj.id).then(function(path) {
        });
      }
    },
    {
      name: 'remove_',
      code: function(x, obj) {
        return this.find(obj.id).then(function(o) {
          if ( o == null ) return obj;

        }.bind(this));
      }
    },
  ]
});
