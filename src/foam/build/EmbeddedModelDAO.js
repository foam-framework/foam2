/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.build',
  name: 'EmbeddedModelDAO',
  extends: 'foam.dao.ProxyDAO',
  requires: [
    'foam.json2.Deserializer'
  ],
  properties: [
    {
      class: 'Map',
      name: 'json'
    },
    {
      class: 'Boolean',
      name: 'loaded',
      value: false
    },
    {
      class: 'Map',
      name: 'loading'
    },
    {
      name: 'deserializer',
      factory: function() {
        return this.Deserializer.create();
      }
    }
  ],
  methods: [
    {
      name: 'load_',
      code: async function(id) {
        var obj = await this.delegate.find(id);

        if ( obj ) return obj;

        if ( this.loading[id] ) return this.loading[id];

        if ( ! this.json[id] ) {
          console.log("No value found for", id);
          return null;
        }

        var json = this.json[id];
        delete this.json[id];
        this.loading[id] = this.deserializer.aparse(this.__context__, json).then(function(obj) {
          return this.delegate.put(obj);
        }.bind(this)).then(function(obj) {
          delete this.loading[id];
          return obj;
        }.bind(this));

        return await this.loading[id];
      }
    },
    {
      name: 'find_',
      code: function(x, id) {
        return this.load_(id);
      }
    },
    {
      name: 'select_',
      code: function(x, sink, skip, limit, order, predicate) {
        var keys = Object.keys(this.json);

        if ( keys.length != 0 ) {
          return Promise.all(keys.map(function(key) {
            return this.load_(key);
          }.bind(this))).then(function() {
            return Promise.all(Object.keys(this.loading).map(k => this.loading[k]));
          }.bind(this)).then(function() {
            console.log("embedded model dao restart query");
            return this.select_(x, sink, skip, limit, order, predicate);
          }.bind(this));
        }

        return this.SUPER(x, sink, skip, limit, order, predicate);
      }
    }
  ]
});
