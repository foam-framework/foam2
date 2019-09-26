/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.dao',
  name: 'Journal',

  methods: [
    {
      name: 'put',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'nu', type: 'foam.core.FObject' }
      ]
    },
    {
      name: 'put_',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'old', type: 'foam.core.FObject' },
        { name: 'nu', type: 'foam.core.FObject' }
      ]
    },
    {
      name: 'remove',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'obj', type: 'foam.core.FObject' }
      ]
    },
    {
      name: 'replay',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'dao', type: 'foam.dao.DAO' }
      ]
    }
  ]
});

foam.INTERFACE({
  package: 'foam.dao',
  name: 'RoutingJournal',

  methods: [
    {
      name: 'put',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'dest', type: 'String' },
        { name: 'nu', type: 'foam.core.FObject' }
      ]
    },
    {
      name: 'put_',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'dest', type: 'String' },
        { name: 'old', type: 'foam.core.FObject' },
        { name: 'nu', type: 'foam.core.FObject' }
      ]
    },
    {
      name: 'remove',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'dest', type: 'String' },
        { name: 'obj', type: 'foam.core.FObject' }
      ]
    },
    {
      name: 'replay',
      args: [
        { name: 'x', type: 'Context' },
      ]
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'AbstractJournal',
  abstract: true,

  implements: [
    'foam.dao.Journal'
  ],

  methods: [
    {
      name: 'put',
      code: function (x, nu) {
        this.put_(x, null, nu);
      },
      javaCode: `
        this.put_(x, null, nu);
      `
    }
  ]
});



foam.CLASS({
  package: 'foam.dao',
  name: 'ProxyJournal',
  extends: 'foam.dao.AbstractJournal',

  documentation: 'Proxy journal class',

  properties: [
    {
      class: 'Proxy',
      of: 'foam.dao.Journal',
      name: 'delegate',
      forwards: [ 'put_', 'remove', 'replay' ]
    }
  ]
});


if ( foam.isServer ) {
  foam.CLASS({
    package: 'foam.dao',
    name: 'NodeFileJournal',
    extends: 'foam.dao.AbstractJournal',

    properties: [
      {
        class: 'Class',
        name: 'of',
        value: 'foam.core.FObject'
      },
      {
        name: 'fd',
        required: true
      },
      {
        name: 'offset',
        factory: function() {
          var stat = this.fs.fstatSync(this.fd);
          return stat.size;
        }
      },
      {
        name: 'fs',
        factory: function() { return require('fs'); }
      },
      {
        name: 'writePromise',
        value: Promise.resolve()
      }
    ],

    methods: [
      function put_(x, old, nu) {
        return this.write_(Buffer.from(
            "put(foam.json.parse(" + foam.json.Storage.stringify(nu, this.of) +
              "));\n"));
      },

      function remove(x, obj) {
        return this.write_(Buffer.from(
            "remove(foam.json.parse(" +
              foam.json.Storage.stringify(obj, this.of) +
              "));\n"));
      },

      function write_(data) {
        var self = this;
        var offset = self.offset;
        self.offset += data.length;
        return self.writePromise = self.writePromise.then(function() {
          return new Promise(function(resolve, reject) {
            self.fs.write(
                self.fd, data, 0, data.length, offset,
                function(err, written, buffer) {
                  if ( err ) reject(err);
                  if ( written != data.length )
                    reject(new Error('foam.dao.NodeFileJournal: Incomplete write'));
                  resolve();
                });
          });
        });
      },

      function replay(x, dao) {
        var self = this;
        return new Promise(function(resolve, reject) {
          self.fs.readFile(self.fd, 'utf8', function(err, data_) {
            if ( err ) {
              reject(err);
              return;
            }

            var context = {
              put: function(o) { return dao.put(o); },
              remove: function(o) { return dao.remove(o); },
              foam: {
                json: {
                  parse: function(obj) {
                    return foam.json.parse(obj, self.of, dao.__context__);
                  }
                }
              }
            };

            with(context) eval(data_);

            resolve(dao);
          });
        });
      }
    ]
  });
}
