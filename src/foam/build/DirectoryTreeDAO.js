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
      factory: function() {
        return this.Deserializer.create();
      }
    },
    {
      name: 'sep',
      factory: function() { return require('path').sep; }
    },
    {
      name: 'fs',
      factory: function() {
        return require('fs')
      },
    }
  ],
  methods: [
    {
      name: 'pathFor_',
      args: [
        { name: 'id', type: 'String' },
      ],
      code: function(id) {
        return this.root + this.sep + id.replace(/\./g, this.sep) + '.js';
      }
    },
    {
      name: 'pathsAt_',
      args: [
        { name: 'root', type: 'String' },
      ],
      code: function(root) {
        var fs = this.fs;
        var sep = this.sep;
        var dirs = [root];
        var files = [];
        while ( dirs.length ) {
          var dir = dirs.pop();
          fs.readdirSync(dir).forEach(function(f) {
            var path = dir + sep + f;
            var lstat = fs.lstatSync(path);
            if ( lstat.isDirectory() ) dirs.push(path)
            else files.push(path)
          })
        }
        return files;
      }
    },
    {
      name: 'loadFile_',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'path', type: 'Stirng' }
      ],
      type: 'foam.core.FObject',
      async: true,
      code: function(x, path) {
        var s = this.fs.readFileSync(path, 'utf-8');
        return this.deserializer.aparseString(x, s)
      }
    },
    {
      name: 'select_',
      code: function(x, sink, skip, limit, order, predicate) {
        sink = sink || this.ArraySink.create();

        var mysink = this.decorateSink_(sink, skip, limit, order, predicate);

        var detached = false;
        var sub = foam.core.FObject.create();
        sub.onDetach(function() { detached = true; });

        return Promise.all(this.pathsAt_(this.root).map(function(path) {
          return this.loadFile_(x, path).then(function(obj) {
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
      code: function(x, id) {
        return this.loadFile_(x, this.pathFor_(id));
      }
    },
    {
      name: 'put_',
      code: function(x, obj) {
        var path = this.pathFor_(obj.id);

        var dirs = path.split(this.sep);
        dirs.pop(); // Don't want a dir with the filename.
        var p = '';
        while ( dirs.length ) {
          p = p + dirs.shift() + this.sep;
          if ( ! this.fs.existsSync(p) ) this.fs.mkdirSync(p);
        }

        var s = this.serializer.stringify(x, obj)
        this.fs.writeFileSync(path, s, 'utf8');
        return Promise.resolve(obj);
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
    {
      name: 'execute',
      code: function() {
        // TODO remove all this. It's just for testing for now.
        var self = this;
        self.root = '/tmp/foam2out/';
        var classloader = self.__context__.classloader;

        Promise.all([
          classloader.load('foam.build.DirCrawlModelDAO'),
          classloader.load('foam.dao.DAOSink'),
        ]).then(function() {
          var sink = foam.dao.DAOSink.create({ dao: self })
          var dao = foam.build.DirCrawlModelDAO.create()
          return dao.select(sink);
        }).then(function() {
          return self.find('foam.apploader.Classloader')
        }).then(function(o) {
          console.log(o.id);
          /*
        }).then(function() {
          return self.select();
        }).then(function(sink) {
          sink.array.forEach(function(model) {
            console.log(model.id);
          })
          */
        });
      },
    },
  ]
});
