foam.CLASS({
  package: 'foam.dao',
  name: 'KeyValueDAO',
  extends: 'foam.dao.ProxyDAO',
  documentation: 'DAO that only responds to put/find',
  methods: [
    {
      name: 'remove_',
      code: function(obj) {
        return Promise.resolve(obj);
      },
      javaCode: 'return obj;'
    },
    {
      name: 'select_',
      code: function(sink) {
        return Promise.resolve(sink);
      },
      javaCode: 'return sink;'
    },
    {
      name: 'removeAll_',
      code: function() {
        return Promise.resolve();
      },
      javaCode: '//noop'
    }
  ]
});
